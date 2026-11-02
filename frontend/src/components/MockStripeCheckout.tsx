'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { PaymentMethod, InvoiceData } from '@/types';
import { downloadInvoiceFile, printInvoice } from '@/lib/invoiceGenerator';
import { fetchOrderInvoiceApi } from '@/lib/api';
import { X, AlertTriangle, Printer, Download } from 'lucide-react';

export const MockStripeCheckout: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    removeFromCart,
    cartTotalINR,
    appliedDiscount,
    claimOfferCode,
    completeCheckout,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');

  // Customer Fields
  const [fullName, setFullName] = useState('Anurag Sharma');
  const [email, setEmail] = useState('anurag@monotime.com');
  const [city, setCity] = useState('New Delhi, India');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');

  // Card Fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12 / 28');
  const [cvc, setCvc] = useState('888');

  // UPI Fields
  const [upiId, setUpiId] = useState('anurag@oksbi');

  // Net Banking Field
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing & State
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<string>('card');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [checkoutError, setCheckoutError] = useState<string>('');

  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');

  // Stock check
  const outOfStockItems = cart.filter((item) => item.product.inStock === false);
  const hasOutOfStock = outOfStockItems.length > 0;

  useEffect(() => {
    if (orderConfirmed && orderId) {
      fetchOrderInvoiceApi(orderId).then((data) => {
        if (data) setInvoiceData(data);
      });
    }
  }, [orderConfirmed, orderId]);

  if (!isCheckoutOpen) return null;

  const handleApplyVoucher = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = voucherInput.trim().toUpperCase();
    if (clean === 'MONOTIME10' || clean === 'HOROLOGY10') {
      claimOfferCode('MONOTIME10');
      setVoucherError('');
      setVoucherInput('');
    } else {
      setVoucherError('Invalid voucher code. Enter MONOTIME10');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (hasOutOfStock) {
      setCheckoutError('Cannot complete acquisition: one or more items in your cart are currently out of stock.');
      return;
    }

    if (cart.length === 0) {
      setCheckoutError('Your bag is currently empty.');
      return;
    }

    setIsProcessing(true);

    setTimeout(async () => {
      const result = await completeCheckout({
        customerName: fullName,
        email,
        city,
        paymentMethod: paymentMethod === 'netbanking' ? 'card' : paymentMethod,
        cardNumber,
        expiry,
        cvc,
        upiId,
        phoneNumber,
      });

      setIsProcessing(false);

      if (result.success) {
        setOrderId(result.orderId);
        setInvoiceNumber(result.invoiceNumber || `INV-2026-${result.orderId.slice(-4)}`);
        setConfirmedPaymentMethod(paymentMethod);
        setOrderConfirmed(true);

        const taxable = Math.round(cartTotalINR / 1.18);
        const gst = cartTotalINR - taxable;
        const cgst = Math.round(gst / 2);
        const sgst = gst - cgst;

        const immediateInvoice: InvoiceData = {
          invoiceNumber: result.invoiceNumber || `INV-2026-${result.orderId.slice(-4)}`,
          orderId: result.orderId,
          invoiceDate: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          company: {
            name: 'Mono Time Haute Horology Inc.',
            cin: 'U74999MH2026PTC384721',
            gstin: '27AABCM8472P1ZK',
            registeredOffice: 'Suite 42, Horology Atelier, Mumbai 400001',
            supportEmail: 'concierge@monotime.com',
            contactPhone: '1800-266-8463',
            website: 'https://monotime.com',
          },
          customer: {
            name: fullName,
            email,
            shippingAddress: city,
            phone: phoneNumber,
          },
          payment: {
            method: paymentMethod.toUpperCase(),
            status: 'COMPLETED (PAID)',
            details: { transactionId: result.orderId },
          },
          financials: {
            currency: 'INR',
            totalAmount: cartTotalINR,
            taxableAmount: taxable,
            cgstAmount: cgst,
            sgstAmount: sgst,
            discountCode: appliedDiscount?.code,
            discountPercent: appliedDiscount?.percent || 0,
            insuredShipping: 'COMPLIMENTARY',
          },
          items: cart.map((i) => ({
            productId: i.product.id,
            productTitle: i.product.title,
            brand: i.product.brand,
            quantity: i.quantity,
            priceINR: i.product.priceINR,
            image: i.product.image,
          })),
          authenticityGuarantee: {
            certificateSerial: `CERT-${result.orderId.slice(-6)}`,
            warrantyPeriod: '2 Years International',
            authenticityVerified: true,
          },
        };
        setInvoiceData(immediateInvoice);
      } else {
        setCheckoutError(result.error || 'Transaction could not be confirmed. Please check your details.');
      }
    }, 1500);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderConfirmed(false);
    setCheckoutError('');
    setVoucherError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-surface border border-hairline rounded-[4px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-1 text-muted hover:text-bone transition-colors"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 11. Persistent slim banner on all checkout screens */}
        <div className="bg-surface-2 border-b border-hairline py-2 px-6 text-center shrink-0">
          <p className="font-mono text-xs text-caution tracking-wide">
            Test mode: no real payment will be taken.
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          {orderConfirmed ? (
            /* Success state: large Newsreader heading "Order confirmed", order number in mono, short summary, secondary "Continue browsing" */
            <div className="py-8 max-w-lg mx-auto flex flex-col items-center text-center gap-6">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                  Acquisition Verified
                </span>
                <h2 className="font-display text-4xl sm:text-5xl text-bone font-normal tracking-tight">
                  Order confirmed
                </h2>
                <p className="font-mono text-sm text-champagne pt-1">
                  ORDER REFERENCE: {orderId}
                </p>
              </div>

              <div className="w-full bg-surface-2 border border-hairline rounded-[4px] p-5 text-left text-xs space-y-3 font-sans">
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span className="text-muted">Client Name:</span>
                  <span className="text-bone">{fullName}</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span className="text-muted">Dispatch Destination:</span>
                  <span className="text-bone">{city}</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span className="text-muted">Payment Method:</span>
                  <span className="text-bone uppercase font-mono">{confirmedPaymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted">Amount Settled:</span>
                  <span className="font-mono text-sm text-bone">
                    ₹{cartTotalINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Invoice actions */}
              <div className="flex items-center gap-3 w-full">
                {invoiceData && (
                  <>
                    <button
                      onClick={() => downloadInvoiceFile(invoiceData)}
                      className="btn-secondary flex-1"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Invoice
                    </button>
                    <button
                      onClick={() => printInvoice(invoiceData)}
                      className="btn-secondary flex-1"
                    >
                      <Printer className="w-4 h-4 mr-1.5" />
                      Print
                    </button>
                  </>
                )}
                <button onClick={handleClose} className="btn-primary flex-1">
                  Continue browsing
                </button>
              </div>
            </div>
          ) : (
            /* Two-column layout: forms on the left, order summary on the right */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Checkout Forms (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                    Checkout
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl text-bone font-normal tracking-tight">
                    Complete your acquisition
                  </h2>
                </div>

                {/* Out of Stock Warning */}
                {hasOutOfStock && (
                  <div className="p-3 border border-error bg-surface-2 text-xs text-error rounded-[4px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Please remove sold out items from your bag to proceed.</span>
                  </div>
                )}

                {/* Failure state */}
                {checkoutError && (
                  <div className="p-4 border border-error bg-surface-2 rounded-[4px] text-xs flex flex-col gap-2">
                    <p className="text-error font-medium">{checkoutError}</p>
                    <button
                      type="button"
                      onClick={() => setCheckoutError('')}
                      className="self-start font-mono text-[11px] text-champagne hover:underline uppercase tracking-wider"
                    >
                      Retry transaction
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Client Details Section */}
                  <div className="flex flex-col gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                      1. Delivery Details
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-faint mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-faint mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-faint mb-1">
                          City, Country
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-faint mb-1">
                          Telephone
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Options as Radio Rows with Hairline Borders */}
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                      2. Payment Method
                    </span>

                    {/* Radio: Card */}
                    <label
                      className={`p-3.5 rounded-[4px] border cursor-pointer transition-colors flex items-center justify-between text-xs ${
                        paymentMethod === 'card'
                          ? 'border-champagne bg-surface-2'
                          : 'border-hairline hover:border-hairline-strong bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="accent-champagne"
                        />
                        <span className="font-sans text-bone">Payment Card (Stripe 3DS)</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted uppercase">Visa · MC · Amex</span>
                    </label>

                    {/* Card Fields if selected: underlined inputs, labels in mono uppercase */}
                    {paymentMethod === 'card' && (
                      <div className="p-4 bg-surface-2 border border-hairline rounded-[4px] space-y-3">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-faint mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 font-mono focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-wider text-faint mb-1">
                              Expiry (MM / YY)
                            </label>
                            <input
                              type="text"
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 font-mono focus:outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-wider text-faint mb-1">
                              CVC / CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value)}
                              className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 font-mono focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Radio: UPI */}
                    <label
                      className={`p-3.5 rounded-[4px] border cursor-pointer transition-colors flex items-center justify-between text-xs ${
                        paymentMethod === 'upi'
                          ? 'border-champagne bg-surface-2'
                          : 'border-hairline hover:border-hairline-strong bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="accent-champagne"
                        />
                        <span className="font-sans text-bone">UPI Instant Transfer</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted uppercase">GPay · PhonePe · Paytm</span>
                    </label>

                    {paymentMethod === 'upi' && (
                      <div className="p-4 bg-surface-2 border border-hairline rounded-[4px]">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-faint mb-1">
                          Virtual Payment Address (VPA / UPI ID)
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. client@oksbi"
                          className="w-full bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone py-1.5 font-mono focus:outline-none transition-colors"
                        />
                      </div>
                    )}

                    {/* Radio: Net Banking */}
                    <label
                      className={`p-3.5 rounded-[4px] border cursor-pointer transition-colors flex items-center justify-between text-xs ${
                        paymentMethod === 'netbanking'
                          ? 'border-champagne bg-surface-2'
                          : 'border-hairline hover:border-hairline-strong bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="netbanking"
                          checked={paymentMethod === 'netbanking'}
                          onChange={() => setPaymentMethod('netbanking')}
                          className="accent-champagne"
                        />
                        <span className="font-sans text-bone">Net Banking</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted uppercase">Major Banks</span>
                    </label>

                    {paymentMethod === 'netbanking' && (
                      <div className="p-4 bg-surface-2 border border-hairline rounded-[4px]">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-faint mb-1">
                          Select Banking Institution
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full bg-surface border border-hairline-strong text-xs text-bone py-1.5 px-2 rounded-[2px] focus:outline-none focus:border-champagne"
                        >
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>State Bank of India</option>
                          <option>Axis Bank</option>
                          <option>Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing || hasOutOfStock || cart.length === 0}
                    className="btn-primary w-full py-3.5 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing acquisition...' : `Confirm acquisition · ₹${cartTotalINR.toLocaleString('en-IN')}`}
                  </button>
                </form>
              </div>

              {/* Right Column: Order Summary (--surface, hairline, mono right-aligned) (5 cols) */}
              <div className="lg:col-span-5 bg-surface border border-hairline rounded-[4px] p-5 sm:p-6 flex flex-col gap-5">
                <div className="border-b border-hairline pb-3 flex items-center justify-between">
                  <span className="font-display text-lg text-bone font-normal">
                    Order summary
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {cart.length} item{cart.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items list */}
                <div className="divide-y divide-hairline max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedWristSize}`}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="relative w-10 h-10 bg-surface-2 border border-hairline rounded-[2px] shrink-0 overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-bone font-sans truncate">{item.product.title}</p>
                        <p className="font-mono text-[10px] text-faint">
                          Qty {item.quantity} · {item.selectedWristSize}
                        </p>
                      </div>
                      <div className="font-mono text-xs text-bone text-right whitespace-nowrap">
                        ₹{(item.product.priceINR * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privilege Voucher Input */}
                <form onSubmit={handleApplyVoucher} className="pt-2 border-t border-hairline flex gap-2">
                  <input
                    type="text"
                    placeholder="Voucher (e.g. MONOTIME10)"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    className="flex-1 bg-surface-2 border border-hairline px-3 py-1.5 text-xs text-bone placeholder-muted focus:outline-none focus:border-champagne rounded-[2px] font-mono uppercase"
                  />
                  <button type="submit" className="btn-secondary py-1.5 px-3 text-[11px]">
                    Apply
                  </button>
                </form>
                {voucherError && <p className="text-error text-[10px]">{voucherError}</p>}
                {appliedDiscount && (
                  <p className="font-mono text-[11px] text-oxide-text">
                    Privilege applied: {appliedDiscount.code} (-{appliedDiscount.percent}%)
                  </p>
                )}

                {/* Summary Lines: mono amounts right-aligned */}
                <div className="border-t border-hairline pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-mono text-bone tabular-nums">
                      ₹{cart.reduce((a, b) => a + b.product.priceINR * b.quantity, 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between items-center text-oxide-text">
                      <span>Privilege discount</span>
                      <span className="font-mono tabular-nums">
                        -₹{(
                          cart.reduce((a, b) => a + b.product.priceINR * b.quantity, 0) -
                          cartTotalINR
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-muted">Insured doorstep dispatch</span>
                    <span className="font-mono text-bone tabular-nums uppercase">Complimentary</span>
                  </div>

                  <div className="border-t border-hairline pt-3 flex justify-between items-baseline">
                    <span className="font-sans text-sm text-bone font-medium">Total</span>
                    <span className="font-mono text-lg text-bone font-medium tabular-nums">
                      ₹{cartTotalINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
