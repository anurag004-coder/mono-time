import { InvoiceData } from '@/types';

/**
 * Generates standalone, print-ready, high-resolution HTML for the Mono Time Tax Invoice.
 */
export function generateInvoiceHtml(data: InvoiceData): string {
  const itemsRows = data.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-family: monospace; font-size: 11px; color: #64748b; text-align: center;">${idx + 1}</td>
        <td style="padding: 12px 8px;">
          <div style="font-weight: 600; color: #0f172a; font-size: 13px;">${item.productTitle}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Brand: ${item.brand || 'Mono Time Horology'} • HSN: 9102 • Serialized Quality Checked</div>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-size: 12px; color: #334155;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 12px; color: #334155; font-family: monospace;">₹${item.priceINR.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 600; font-size: 13px; color: #0f172a; font-family: monospace;">₹${(item.priceINR * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${data.invoiceNumber} | Mono Time Luxury Horology</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.5;
    }
    @media print {
      body { padding: 0; margin: 0; max-width: 100%; }
      .no-print { display: none !important; }
      @page { margin: 1.5cm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <!-- Print Control Banner (Hidden in print) -->
  <div class="no-print" style="margin-bottom: 24px; padding: 14px 20px; background: #0f172a; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
    <div style="font-size: 13px;">
      <strong style="color: #10b981;">Mono Time Client Portal</strong> • Official Customer Tax Invoice (Order #${data.orderId})
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #10b981; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer;">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="background: #334155; color: #ffffff; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; cursor: pointer;">
        Close
      </button>
    </div>
  </div>

  <!-- Header -->
  <header style="border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; font-family: Georgia, serif; color: #0f172a;">MONO TIME</span>
        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.5px;">Haute Horology</span>
      </div>
      <div style="font-size: 11px; color: #475569; max-width: 380px;">
        <strong>${data.company.name}</strong><br/>
        CIN: ${data.company.cin} • GSTIN: <strong>${data.company.gstin}</strong><br/>
        Registered Office: ${data.company.registeredOffice}<br/>
        Concierge: ${data.company.supportEmail} • ${data.company.contactPhone}
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 18px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px;">TAX INVOICE</div>
      <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 4px;">Invoice No: <span style="font-family: monospace;">${data.invoiceNumber}</span></div>
      <div style="font-size: 12px; color: #475569;">Date: ${data.invoiceDate}</div>
      <div style="font-size: 12px; color: #475569;">Order ID: <span style="font-family: monospace; font-weight: 600;">${data.orderId}</span></div>
    </div>
  </header>

  <!-- Bill To & Shipping Details -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
    <div>
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px;">Customer / Billed To:</div>
      <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${data.customer.name}</div>
      <div style="font-size: 12px; color: #475569; margin-top: 2px;">Email: ${data.customer.email}</div>
      ${data.customer.phone ? `<div style="font-size: 12px; color: #475569;">Phone: ${data.customer.phone}</div>` : ''}
    </div>
    <div>
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px;">Shipping Destination & Mode:</div>
      <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${data.customer.shippingAddress}</div>
      <div style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 3px;">
        Payment Method: ${data.payment.method} (${data.payment.status})
      </div>
      <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 1px;">
        Ref: ${data.payment.details?.transaction_ref || data.payment.details?.upi_id || 'VERIFIED-SETTLED'}
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <thead>
      <tr style="background: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">
        <th style="padding: 10px 8px; width: 40px; text-align: center; border-top-left-radius: 8px;">#</th>
        <th style="padding: 10px 8px; text-align: left;">Item Description & Specifications</th>
        <th style="padding: 10px 8px; width: 60px; text-align: center;">Qty</th>
        <th style="padding: 10px 8px; width: 110px; text-align: right;">Unit Price</th>
        <th style="padding: 10px 8px; width: 120px; text-align: right; border-top-right-radius: 8px;">Total (INR)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <!-- Calculation Summary -->
  <div style="display: flex; justify-content: flex-end; margin-bottom: 28px;">
    <div style="width: 320px; font-size: 12px;">
      <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #475569;">
        <span>Taxable Net Amount:</span>
        <span style="font-family: monospace; font-weight: 600; color: #0f172a;">₹${data.financials.taxableAmount.toLocaleString('en-IN')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #475569;">
        <span>Central GST (CGST @ 9%):</span>
        <span style="font-family: monospace; color: #0f172a;">₹${data.financials.cgstAmount.toLocaleString('en-IN')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #475569;">
        <span>State GST (SGST @ 9%):</span>
        <span style="font-family: monospace; color: #0f172a;">₹${data.financials.sgstAmount.toLocaleString('en-IN')}</span>
      </div>
      ${
        data.financials.discountCode
          ? `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #059669; font-weight: 600;">
        <span>Privilege Voucher (${data.financials.discountCode}):</span>
        <span style="font-family: monospace;">-${data.financials.discountPercent}%</span>
      </div>
      `
          : ''
      }
      <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #475569;">
        <span>Insured Express Courier:</span>
        <span style="color: #059669; font-weight: 600;">${data.financials.insuredShipping}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0 6px; border-top: 2px solid #0f172a; margin-top: 6px; font-size: 15px; font-weight: 800; color: #0f172a;">
        <span>Grand Total Paid:</span>
        <span style="color: #059669; font-family: monospace; font-size: 17px;">₹${data.financials.totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>
  </div>

  <!-- Authenticity & Warranty Guarantee -->
  <div style="border: 1px dashed #059669; background: #f0fdf4; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between;">
    <div>
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px;">
        ✨ Certificate of Horological Authenticity & Manufacturer Warranty
      </div>
      <div style="font-size: 11px; color: #166534; margin-top: 2px;">
        Every timepiece in this invoice has undergone strict timing tolerance & water-resistance inspection.
        Includes <strong>${data.authenticityGuarantee?.warrantyPeriod || '2-Year Manufacturer Warranty'}</strong>.
      </div>
    </div>
    <div style="text-align: right; font-family: monospace; font-size: 11px; color: #166534; font-weight: 700; border-left: 1px solid #bbf7d0; padding-left: 16px;">
      Serial: ${data.authenticityGuarantee?.certificateSerial || 'COA-88741-MONO'}
    </div>
  </div>

  <!-- Footer & Digital Signatory -->
  <footer style="border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b;">
    <div>
      <div>This is a computer-generated tax invoice verified under GST Rules 2017.</div>
      <div>Questions regarding sizing, adjustment, or logistics? Visit <strong>https://monotime.luxury</strong></div>
    </div>
    <div style="text-align: center;">
      <div style="font-family: 'Brush Script MT', cursive, Georgia, serif; font-size: 20px; color: #0f172a; margin-bottom: 4px;">
        Anurag Sharma
      </div>
      <div style="border-top: 1px solid #94a3b8; padding-top: 2px; font-weight: 600; color: #334155; font-size: 10px;">
        Authorized Signatory • Mono Time Luxury Horology
      </div>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Downloads the tax invoice as an HTML/print-ready file directly to the user's computer.
 */
export function downloadInvoiceFile(data: InvoiceData): void {
  const htmlContent = generateInvoiceHtml(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `MonoTime_Tax_Invoice_${data.orderId}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Opens a dedicated print window with the formatted tax invoice and triggers the print dialog.
 */
export function printInvoice(data: InvoiceData): void {
  const htmlContent = generateInvoiceHtml(data);
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    // Fallback: download if pop-up was blocked
    downloadInvoiceFile(data);
  }
}
