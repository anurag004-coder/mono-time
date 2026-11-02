import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.checkout import CheckoutOrderModel
from app.models.pitch import PitchEventModel
from app.models.product import ProductModel

router = APIRouter(prefix="/checkout", tags=["Checkout"])

class CheckoutIntentRequest(BaseModel):
    amount_inr: int
    currency: Optional[str] = "inr"
    discount_code: Optional[str] = None
    discount_percent: Optional[int] = 0
    items: Optional[List[Dict[str, Any]]] = []

class CheckStockItem(BaseModel):
    product_id: str
    quantity: Optional[int] = 1

class CheckStockRequest(BaseModel):
    items: List[CheckStockItem]

class CheckoutConfirmRequest(BaseModel):
    intent_id: Optional[str] = None
    payment_method: Optional[str] = "card"  # 'card' | 'upi' | 'cod'
    card_number: Optional[str] = "4242424242424242"
    expiry: Optional[str] = "12/28"
    cvc: Optional[str] = "888"
    upi_id: Optional[str] = None
    phone_number: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    shipping_city: Optional[str] = None
    session_id: Optional[str] = "session-guest"
    amount_inr: Optional[int] = 0
    discount_code: Optional[str] = None
    discount_percent: Optional[int] = 0
    items: Optional[List[Dict[str, Any]]] = []

@router.post("/check-stock")
def check_stock(body: CheckStockRequest, db: Session = Depends(get_db)):
    """
    Verify stock availability for a list of items prior to checkout or cart addition.
    """
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
def create_payment_intent(body: CheckoutIntentRequest):
    intent_id = f"pi_mock_{uuid.uuid4().hex[:12]}"
    client_secret = f"{intent_id}_secret_{uuid.uuid4().hex[:8]}"
    return {
        "clientSecret": client_secret,
        "intentId": intent_id,
        "amount": body.amount_inr,
        "currency": body.currency,
        "status": "requires_payment_method",
    }

@router.post("/confirm")
def confirm_payment(body: CheckoutConfirmRequest, db: Session = Depends(get_db)):
    payment_method = (body.payment_method or "card").lower()

    # 1. Real-time Inventory / Stock Verification
    if body.items:
        for it in body.items:
            pid = it.get("productId") or it.get("id") or it.get("product_id")
            if pid:
                prod = db.query(ProductModel).filter(ProductModel.id == pid).first()
                if prod and not prod.inStock:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Item '{prod.title}' is currently out of stock and cannot be purchased."
                    )

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
        amount_inr=body.amount_inr or 0,
        discount_code=body.discount_code,
        discount_percent=body.discount_percent or 0,
        status=status,
        customer_name=body.customer_name or "Anurag Sharma",
        customer_email=body.customer_email or "customer@monotime.luxury",
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

    # Convert pitch if exists
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
def list_checkout_orders(limit: int = 50, db: Session = Depends(get_db)):
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
def get_checkout_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(CheckoutOrderModel).filter(CheckoutOrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
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
def get_order_invoice(order_id: str, db: Session = Depends(get_db)):
    """
    Returns structured tax invoice data for customer receipt generation & printing.
    """
    order = db.query(CheckoutOrderModel).filter(CheckoutOrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    invoice_number = f"INV-{order.created_at.strftime('%Y%m') if order.created_at else '2026'}-{order.id.split('-')[-1]}"
    
    total_amount = order.amount_inr
    net_taxable_amount = round(total_amount / 1.18)
    total_gst = total_amount - net_taxable_amount
    cgst = round(total_gst / 2)
    sgst = total_gst - cgst

    return {
        "invoiceNumber": invoice_number,
        "orderId": order.id,
        "invoiceDate": order.created_at.strftime("%d %B %Y, %I:%M %p") if order.created_at else "23 September 2026",
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
        "payment": {
            "method": (order.payment_method or "card").upper(),
            "status": order.status.upper(),
            "details": order.payment_details or {},
        },
        "financials": {
            "currency": "INR",
            "totalAmount": total_amount,
            "taxableAmount": net_taxable_amount,
            "cgstAmount": cgst,
            "sgstAmount": sgst,
            "discountCode": order.discount_code,
            "discountPercent": order.discount_percent,
            "insuredShipping": "Complimentary (₹0)",
        },
        "items": order.items_json or [],
        "authenticityGuarantee": {
            "certificateSerial": f"COA-{uuid.uuid4().hex[:8].upper()}",
            "warrantyPeriod": "2-Year International Manufacturer Horological Guarantee",
            "authenticityVerified": True
        }
    }
