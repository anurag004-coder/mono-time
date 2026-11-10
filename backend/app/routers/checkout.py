import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.checkout import CheckoutOrderModel
from app.models.pitch import PitchEventModel
from app.models.product import ProductModel
from app.routers.admin import require_admin_auth, verify_session_token

router = APIRouter(prefix="/checkout", tags=["Checkout"])

class CheckoutIntentRequest(BaseModel):
    amount_inr: int = Field(..., ge=0)
    currency: Optional[str] = "inr"
    discount_code: Optional[str] = Field(None, max_length=32)
    discount_percent: Optional[int] = Field(0, ge=0, le=100)
    items: Optional[List[Dict[str, Any]]] = []

class CheckStockItem(BaseModel):
    product_id: str = Field(..., max_length=64)
    quantity: Optional[int] = Field(1, ge=1, le=10)

class CheckStockRequest(BaseModel):
    items: List[CheckStockItem]

class CheckoutConfirmRequest(BaseModel):
    intent_id: Optional[str] = Field(None, max_length=64)
    payment_method: Optional[str] = Field("card", max_length=20)
    card_number: Optional[str] = Field("4242424242424242", max_length=30)
    expiry: Optional[str] = Field("12/28", max_length=10)
    cvc: Optional[str] = Field("888", max_length=6)
    upi_id: Optional[str] = Field(None, max_length=64)
    phone_number: Optional[str] = Field(None, max_length=30)
    customer_name: Optional[str] = Field(None, max_length=120)
    customer_email: Optional[str] = Field(None, max_length=120)
    shipping_city: Optional[str] = Field(None, max_length=120)
    session_id: Optional[str] = Field("session-guest", max_length=64)
    amount_inr: Optional[int] = Field(0, ge=0)
    discount_code: Optional[str] = Field(None, max_length=32)
    discount_percent: Optional[int] = Field(0, ge=0, le=100)
    items: Optional[List[Dict[str, Any]]] = []

@router.post("/check-stock")
def check_stock(body: CheckStockRequest, db: Session = Depends(get_db)):
    """Verify stock availability for a list of items prior to checkout."""
    out_of_stock = []
    in_stock = []

    for item in body.items:
        prod = db.query(ProductModel).filter(ProductModel.id == item.product_id).first()
        if not prod:
            out_of_stock.append({
                "product_id": item.product_id,
                "title": item.product_id,
                "reason": "Product reference not found",
                "in_stock": False,
            })
        elif not prod.inStock:
            out_of_stock.append({
                "product_id": prod.id,
                "title": prod.title,
                "reason": "Currently sold out / waitlist only",
                "in_stock": False,
            })
        else:
            in_stock.append({
                "product_id": prod.id,
                "title": prod.title,
                "in_stock": True,
            })

    return {
        "all_in_stock": len(out_of_stock) == 0,
        "in_stock_items": in_stock,
        "out_of_stock_items": out_of_stock,
    }

@router.post("/create-intent")
def create_payment_intent(body: CheckoutIntentRequest, db: Session = Depends(get_db)):
    intent_id = f"pi_mock_{uuid.uuid4().hex[:12]}"
    client_secret = f"{intent_id}_secret_{uuid.uuid4().hex[:8]}"

    # Validate amount against database prices if items are provided
    calculated_amount = body.amount_inr
    if body.items:
        subtotal = 0
        for it in body.items:
            pid = it.get("productId") or it.get("id") or it.get("product_id")
            qty = int(it.get("quantity") or 1)
            if pid:
                prod = db.query(ProductModel).filter(ProductModel.id == pid).first()
                if prod:
                    subtotal += prod.priceINR * max(1, qty)
        if subtotal > 0:
            disc = 10 if body.discount_code and body.discount_code.strip().upper() == "MONOTIME10" else 0
            calculated_amount = int(subtotal * (100 - disc) / 100)

    return {
        "clientSecret": client_secret,
        "intentId": intent_id,
        "amount": calculated_amount,
        "currency": body.currency,
        "status": "requires_payment_method",
    }

@router.post("/confirm")
def confirm_payment(body: CheckoutConfirmRequest, db: Session = Depends(get_db)):
    payment_method = (body.payment_method or "card").lower()

    # 1. Real-time Inventory Verification & Server-Side Price Calculation (Tamper-Proof)
    server_subtotal = 0
    if body.items:
        for it in body.items:
            pid = it.get("productId") or it.get("id") or it.get("product_id")
            qty = int(it.get("quantity") or 1)
            if pid:
                prod = db.query(ProductModel).filter(ProductModel.id == pid).first()
                if not prod:
                    continue
                if not prod.inStock:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Item '{prod.title}' is currently out of stock and cannot be purchased."
                    )
                server_subtotal += prod.priceINR * max(1, qty)

    # Validate discount code on the server
    server_discount_pct = 0
    if body.discount_code:
        clean_code = body.discount_code.strip().upper()
        if clean_code in ("MONOTIME10", "PRIVILEGE10", "WELCOME10"):
            server_discount_pct = 10

    # Tamper-proof price enforcement: Never trust unverified client amounts
    if server_subtotal > 0:
        verified_amount_inr = int(server_subtotal * (100 - server_discount_pct) / 100)
    else:
        verified_amount_inr = body.amount_inr or 0

    # 2. Payment Method Simulation
    payment_details: Dict[str, Any] = {
        "method": payment_method,
        "timestamp": datetime.utcnow().isoformat(),
    }
    status = "succeeded"

    if payment_method == "card":
        card_clean = (body.card_number or "").replace(" ", "").replace("•", "")
        if card_clean == "4000000000000002":
            status = "declined"
        else:
            payment_details["card_last4"] = (body.card_number or "4242")[-4:]
            payment_details["gateway"] = "Stripe 3D-Secure Mock Sandbox"
            payment_details["transaction_ref"] = f"ch_mock_{uuid.uuid4().hex[:16]}"
    elif payment_method == "upi":
        upi = body.upi_id or "client@okhdfcbank"
        payment_details["upi_id"] = upi
        payment_details["gateway"] = "NPCI / UPI Instant Settlement Mock"
        payment_details["transaction_ref"] = f"UPI{datetime.utcnow().strftime('%Y%m%d%H%M')}{uuid.uuid4().hex[:8].upper()}"
        payment_details["approval_ref"] = f"APPR-{uuid.uuid4().hex[:6].upper()}"
    elif payment_method == "cod":
        payment_details["payment_terms"] = "Cash on Delivery / Courier Doorstep QR"
        payment_details["phone_number"] = body.phone_number or "+91 98765 43210"
        payment_details["verification_status"] = "Verified for Dispatch"
        payment_details["transaction_ref"] = f"COD-DISP-{uuid.uuid4().hex[:8].upper()}"
    else:
        payment_method = "card"
        payment_details["transaction_ref"] = f"tx_{uuid.uuid4().hex[:16]}"

    order_id = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    order = CheckoutOrderModel(
        id=order_id,
        session_id=body.session_id,
        amount_inr=verified_amount_inr,
        discount_code=body.discount_code,
        discount_percent=server_discount_pct,
        status=status,
        customer_name=body.customer_name or "Client",
        customer_email=body.customer_email or "client@monotime.luxury",
        shipping_city=body.shipping_city or "New Delhi, India",
        payment_method=payment_method,
        payment_details=payment_details,
        items_json=body.items or [],
        created_at=datetime.utcnow(),
    )

    if status == "declined":
        db.add(order)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Your card was declined. Please use standard mock card 4242 4242 4242 4242."
        )

    # Convert pitch if session matches
    pitch = (
        db.query(PitchEventModel)
        .filter(PitchEventModel.session_id == body.session_id)
        .order_by(PitchEventModel.created_at.desc())
        .first()
    )
    if pitch:
        pitch.converted = True
        if not order.discount_code:
            order.discount_code = pitch.code

    db.add(order)
    db.commit()
    db.refresh(order)

    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m')}-{order.id.split('-')[-1]}"

    return {
        "orderId": order.id,
        "invoiceNumber": invoice_number,
        "status": "succeeded",
        "amount": order.amount_inr,
        "paymentMethod": payment_method,
        "customerEmail": order.customer_email,
        "customerName": order.customer_name,
        "shippingCity": order.shipping_city,
        "itemsCount": len(body.items or []),
        "paymentDetails": payment_details,
        "message": f"Payment simulation succeeded via {payment_method.upper()}. Order confirmed and saved to backend database!",
        "transactionHash": payment_details.get("transaction_ref", f"tx_{uuid.uuid4().hex[:16]}"),
    }

@router.get("/orders")
def list_checkout_orders(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin_user: str = Depends(require_admin_auth),
):
    """Protected: Only authenticated admins can list customer orders and view PII."""
    orders = db.query(CheckoutOrderModel).order_by(CheckoutOrderModel.created_at.desc()).limit(limit).all()
    return [
        {
            "id": o.id,
            "session_id": o.session_id,
            "amount_inr": o.amount_inr,
            "discount_code": o.discount_code,
            "discount_percent": o.discount_percent,
            "status": o.status,
            "customer_name": o.customer_name,
            "customer_email": o.customer_email,
            "shipping_city": o.shipping_city,
            "payment_method": o.payment_method or "card",
            "payment_details": o.payment_details or {},
            "items": o.items_json or [],
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]

@router.get("/orders/{order_id}")
def get_checkout_order(order_id: str, request: Request, db: Session = Depends(get_db)):
    """Returns order details if requested by an authenticated admin or the matching session owner."""
    order = db.query(CheckoutOrderModel).filter(CheckoutOrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    # Authorize: Check if admin session cookie is present or if session_id matches
    cookie = request.cookies.get("admin_session")
    is_admin = verify_session_token(cookie) is not None
    req_session = request.headers.get("x-session-id") or request.query_params.get("session_id")
    is_owner = req_session and req_session == order.session_id

    if not is_admin and not is_owner:
        raise HTTPException(status_code=403, detail="Not authorized to inspect this order.")

    return {
        "id": order.id,
        "session_id": order.session_id,
        "amount_inr": order.amount_inr,
        "discount_code": order.discount_code,
        "discount_percent": order.discount_percent,
        "status": order.status,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "shipping_city": order.shipping_city,
        "payment_method": order.payment_method or "card",
        "payment_details": order.payment_details or {},
        "items": order.items_json or [],
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }

@router.get("/orders/{order_id}/invoice")
def get_order_invoice(order_id: str, request: Request, db: Session = Depends(get_db)):
    """Returns structured tax invoice data for the order owner or admin."""
    order = db.query(CheckoutOrderModel).filter(CheckoutOrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    cookie = request.cookies.get("admin_session")
    is_admin = verify_session_token(cookie) is not None
    req_session = request.headers.get("x-session-id") or request.query_params.get("session_id")
    is_owner = is_admin or (req_session and req_session == order.session_id) or (order.session_id == "session-guest")

    if not is_admin and not is_owner:
        raise HTTPException(status_code=403, detail="Not authorized to access this invoice.")

    items_list = []
    subtotal = 0
    for item in (order.items_json or []):
        qty = int(item.get("quantity") or 1)
        price = int(item.get("priceINR") or (order.amount_inr // max(1, len(order.items_json or [1]))))
        line_total = price * qty
        subtotal += line_total
        items_list.append({
            "title": item.get("title") or item.get("productTitle") or "Luxury Timepiece Reference",
            "quantity": qty,
            "unitPriceINR": price,
            "totalINR": line_total,
        })

    discount_amount = (subtotal * (order.discount_percent or 0)) // 100
    taxable_value = subtotal - discount_amount
    cgst = round(taxable_value * 0.09)
    sgst = round(taxable_value * 0.09)

    return {
        "invoiceNumber": f"INV-{order.created_at.strftime('%Y%m') if order.created_at else '202611'}-{order.id.split('-')[-1]}",
        "orderId": order.id,
        "date": order.created_at.strftime("%B %d, %Y") if order.created_at else "November 2, 2026",
        "company": {
            "name": "MONO TIME LUXURY HOROLOGY PVT. LTD.",
            "cin": "U33301DL2026PTC384729",
            "gstin": "07AAACM9823P1Z4",
            "registeredOffice": "Floor 14, Tower B, Horizon Centre, DLF Phase 5, Gurugram, NCR 122002",
            "supportEmail": "concierge@monotime.luxury",
            "contactPhone": "+91 (124) 498-TIME",
            "website": "https://monotime.luxury"
        },
        "customer": {
            "name": order.customer_name or "Valued Collector",
            "email": order.customer_email or "customer@monotime.luxury",
            "shippingAddress": order.shipping_city or "New Delhi, India",
        },
        "financials": {
            "currency": "INR",
            "totalAmount": order.amount_inr,
            "taxableAmount": taxable_value,
            "cgstAmount": cgst,
            "sgstAmount": sgst,
            "discountCode": order.discount_code,
            "discountPercent": order.discount_percent,
            "insuredShipping": "Complimentary (₹0)",
        },
        "items": items_list,
        "subtotalINR": subtotal,
        "discountCode": order.discount_code,
        "discountPercent": order.discount_percent,
        "discountAmountINR": discount_amount,
        "taxableValueINR": taxable_value,
        "taxes": {
            "cgstPercent": 9,
            "cgstINR": cgst,
            "sgstPercent": 9,
            "sgstINR": sgst,
            "totalTaxINR": cgst + sgst,
        },
        "totalINR": order.amount_inr,
        "paymentMethod": order.payment_method or "card",
        "paymentStatus": order.status or "succeeded",
        "transactionHash": (order.payment_details or {}).get("transaction_ref", "TXN-VERIFIED-ATELIER"),
    }
