from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_check_stock_endpoint():
    # Test checking in-stock and out-of-stock items
    payload = {
        "items": [
            {"product_id": "titan-edge-slate", "quantity": 1},
            {"product_id": "oceanic-diver-pro", "quantity": 1},
            {"product_id": "non-existent-watch", "quantity": 1},
        ]
    }
    response = client.post("/api/checkout/check-stock", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["all_in_stock"] is False
    assert any(it["product_id"] == "titan-edge-slate" and it["in_stock"] is True for it in data["in_stock_items"])
    assert any(it["product_id"] == "oceanic-diver-pro" and it["in_stock"] is False for it in data["out_of_stock_items"])
    assert any(it["product_id"] == "non-existent-watch" and it["in_stock"] is False for it in data["out_of_stock_items"])

def test_checkout_rejects_out_of_stock_product():
    # Attempting to purchase oceanic-diver-pro which is marked out of stock
    payload = {
        "customer_name": "Test Collector",
        "customer_email": "test@monotime.luxury",
        "shipping_city": "Mumbai, India",
        "amount_inr": 29995,
        "payment_method": "card",
        "card_number": "4242424242424242",
        "items": [
            {
                "productId": "oceanic-diver-pro",
                "productTitle": "Oceanic Pro Diver 300M Automatic",
                "quantity": 1,
                "priceINR": 29995
            }
        ]
    }
    response = client.post("/api/checkout/confirm", json=payload)
    assert response.status_code == 400
    assert "currently out of stock" in response.json()["detail"].lower()

def test_checkout_upi_payment():
    payload = {
        "customer_name": "Rahul Verma",
        "customer_email": "rahul@example.com",
        "shipping_city": "Bengaluru, India",
        "amount_inr": 24999,
        "payment_method": "upi",
        "upi_id": "rahul@oksbi",
        "items": [
            {
                "productId": "titan-edge-slate",
                "productTitle": "Titan Edge Minimalist Slate Steel Dress Watch",
                "quantity": 1,
                "priceINR": 24999
            }
        ]
    }
    response = client.post("/api/checkout/confirm", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "succeeded"
    assert data["paymentMethod"] == "upi"
    assert "invoiceNumber" in data
    assert data["paymentDetails"]["upi_id"] == "rahul@oksbi"
    assert "UPI" in data["transactionHash"]

def test_checkout_cod_payment():
    payload = {
        "customer_name": "Priya Nair",
        "customer_email": "priya@example.com",
        "shipping_city": "Cochin, India",
        "phone_number": "+91 98450 12345",
        "amount_inr": 16495,
        "payment_method": "cod",
        "items": [
            {
                "productId": "casio-edifice-speed",
                "productTitle": "Casio Edifice Solar Speed Chronograph",
                "quantity": 1,
                "priceINR": 16495
            }
        ]
    }
    response = client.post("/api/checkout/confirm", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "succeeded"
    assert data["paymentMethod"] == "cod"
    assert data["paymentDetails"]["phone_number"] == "+91 98450 12345"

def test_invoice_generation():
    # Place order first
    payload = {
        "customer_name": "Vikram Seth",
        "customer_email": "vikram@monotime.luxury",
        "shipping_city": "New Delhi, India",
        "amount_inr": 24999,
        "payment_method": "card",
        "card_number": "4242424242424242",
        "items": [
            {
                "productId": "titan-edge-slate",
                "productTitle": "Titan Edge Minimalist Slate Steel Dress Watch",
                "brand": "Titan",
                "quantity": 1,
                "priceINR": 24999
            }
        ]
    }
    res = client.post("/api/checkout/confirm", json=payload)
    assert res.status_code == 200
    order_id = res.json()["orderId"]

    # Fetch invoice
    inv_res = client.get(f"/api/checkout/orders/{order_id}/invoice")
    assert inv_res.status_code == 200
    inv = inv_res.json()
    assert inv["orderId"] == order_id
    assert inv["invoiceNumber"].startswith("INV-")
    assert inv["financials"]["totalAmount"] == 24999
    assert inv["financials"]["taxableAmount"] > 0
    assert inv["financials"]["cgstAmount"] > 0
    assert inv["financials"]["sgstAmount"] > 0
    assert inv["company"]["gstin"] == "07AAACM9823P1Z4"
    assert inv["customer"]["name"] == "Vikram Seth"

def test_toggle_product_stock():
    # Toggle stock off then back on
    res1 = client.post("/api/products/titan-edge-slate/toggle-stock")
    assert res1.status_code == 200
    assert res1.json()["inStock"] is False

    # Try to purchase when out of stock
    bad_order = {
        "amount_inr": 24999,
        "items": [{"productId": "titan-edge-slate", "quantity": 1}]
    }
    fail_res = client.post("/api/checkout/confirm", json=bad_order)
    assert fail_res.status_code == 400

    # Toggle back on
    res2 = client.post("/api/products/titan-edge-slate/toggle-stock")
    assert res2.status_code == 200
    assert res2.json()["inStock"] is True
