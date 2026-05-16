import {Order, PaymentMethod} from "../types/order";
import * as Print from 'expo-print';
import {useSettingsStore} from "../store/useSettingsStore";

export const pdfService = {

    generateHtml: (order: Order) => {
        const {shopInfo} = useSettingsStore.getState();

        const itemsHtml = order.items.map(item => `
          <tr class="item">
            <td>${item.name}<br><span class="subtitle">Qty: ${item.quantity}</span></td>
            <td style="text-align: right;">৳${item.price * item.quantity}</td>
          </tr>
        `).join('');

        // Generate Payment Details HTML
        let paymentDetailsHtml = `<p><span>Method:</span> <span>${order.paymentMethod}</span></p>`;
        
        if (order.paymentMethod === 'CARD' && order.cardDetails) {
             paymentDetailsHtml += `
                 <p><span>Card:</span> <span>${order.cardDetails.cardType || 'Card'} ending in **${order.cardDetails.lastFourDigits || 'XXXX'}</span></p>
                 ${order.cardDetails.transactionId ? `<p><span>TrxID:</span> <span>${order.cardDetails.transactionId}</span></p>` : ''}
             `;
        } else if (order.paymentMethod === 'MFS' && order.mfsDetails) {
             paymentDetailsHtml += `
                 <p><span>MFS:</span> <span>${order.mfsDetails.mfsType || 'Mobile Banking'} (${order.mfsDetails.phoneNumber || 'N/A'})</span></p>
                 ${order.mfsDetails.transactionId ? `<p><span>TrxID:</span> <span>${order.mfsDetails.transactionId}</span></p>` : ''}
             `;
        } else if (order.paymentMethod === 'SPLIT' && order.splitPaymentDetails) {
             paymentDetailsHtml += `<p style="font-weight: bold; margin-top: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Split Payment Breakdown:</p>`;
             
             if (order.splitPaymentDetails.cashAmount > 0) {
                 paymentDetailsHtml += `<p><span>Cash:</span> <span>৳${order.splitPaymentDetails.cashAmount}</span></p>`;
             }
             if (order.splitPaymentDetails.cardAmount > 0) {
                 paymentDetailsHtml += `<p><span>Card (${order.splitPaymentDetails.cardDetails?.cardType || 'N/A'} **${order.splitPaymentDetails.cardDetails?.lastFourDigits || 'XXXX'}):</span> <span>৳${order.splitPaymentDetails.cardAmount}</span></p>`;
             }
             if (order.splitPaymentDetails.mfsAmount > 0) {
                 paymentDetailsHtml += `<p><span>MFS (${order.splitPaymentDetails.mfsDetails?.mfsType || 'N/A'}):</span> <span>৳${order.splitPaymentDetails.mfsAmount}</span></p>`;
             }
        }

        // Generate Customer HTML
        let customerHtml = '';
        if (order.customer) {
            customerHtml = `
              <div class="invoice-details" style="margin-top: 10px;">
                <p style="font-weight: bold; margin-bottom: 5px;">Customer Info:</p>
                <p><span>Name:</span> <span>${order.customer.name}</span></p>
                ${order.customer.phone ? `<p><span>Phone:</span> <span>${order.customer.phone}</span></p>` : ''}
              </div>
            `;
        }

        // Generate Discount HTML
        let discountHtml = '';
        if (order.discount && order.discount.amountCalculated > 0) {
            const discountLabel = order.discount.type === 'PERCENTAGE' 
                ? `Discount (${order.discount.value}%)` 
                : 'Discount (Fixed)';
            
            discountHtml = `
                <div class="row" style="color: #e11d48;">
                  <span>${discountLabel}</span>
                  <span>- ৳${order.discount.amountCalculated.toFixed(2)}</span>
                </div>
            `;
        }

        // Generate Tax HTML
        let taxHtml = '';
        if (order.tax && order.tax.taxAmount > 0) {
             const taxLabel = `${order.tax.taxName} (${order.tax.taxRate}%) ${order.tax.isInclusive ? '[Incl]' : '[Excl]'}`;
             taxHtml = `
                 <div class="row">
                   <span>${taxLabel}</span>
                   <span>${order.tax.isInclusive ? 'Included' : `+ ৳${order.tax.taxAmount.toFixed(2)}`}</span>
                 </div>
             `;
        }

        // Determine SubTotal
        const subTotalVal = order.subTotal || (order.totalAmount + (order.discount?.amountCalculated || 0) - (order.tax && !order.tax.isInclusive ? order.tax.taxAmount : 0));

        // Generate Status Watermark and Info Box
        let statusWatermark = '';
        let statusInfoBox = '';
        if (order.status !== 'COMPLETED') {
            statusWatermark = `<div class="watermark">${order.status}</div>`;
            
            let reason = 'Not provided';
            let date = '';
            if (order.status === 'REFUNDED' && order.refundDetails) {
                reason = order.refundDetails.reason || 'Not provided';
                date = new Date(order.refundDetails.refundDate).toLocaleString();
            } else if (order.status === 'EXCHANGED' && order.exchangeDetails) {
                reason = order.exchangeDetails.reason || 'Not provided';
                date = new Date(order.exchangeDetails.exchangeDate).toLocaleString();
            } else if (order.status === 'RETURNED' && order.returnDetails) {
                reason = order.returnDetails.reason || 'Not provided';
                date = new Date(order.returnDetails.returnDate).toLocaleString();
            }

            statusInfoBox = `
                <div class="status-box">
                    <p><strong>Status:</strong> ${order.status}</p>
                    ${date ? `<p><strong>Date:</strong> ${date}</p>` : ''}
                    <p><strong>Reason:</strong> ${reason}</p>
                </div>
            `;
        }

        return `
          <html>
          
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <style>
                body { 
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                    padding: 20px; 
                    color: #333; 
                    position: relative;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 80px;
                    color: rgba(255, 0, 0, 0.1);
                    font-weight: bold;
                    z-index: -1;
                    text-transform: uppercase;
                }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; font-weight: bold; color: #2563eb; }
                .header p { margin: 2px 0; font-size: 12px; color: #666; }
                
                .invoice-details { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
                .invoice-details p { margin: 4px 0; font-size: 12px; display: flex; justify-content: space-between; }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { text-align: left; font-size: 12px; border-bottom: 1px solid #ddd; padding: 5px 0; }
                td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
                .item td { vertical-align: top; }
                .subtitle { font-size: 10px; color: #888; }
                
                .totals { margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; }
                .totals .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
                .totals .total { font-weight: bold; font-size: 18px; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
                
                .payment-section { margin-top: 20px; background-color: #f9fafb; padding: 10px; border-radius: 8px; border: 1px solid #eee; }
                
                .status-box {
                    margin-top: 20px;
                    padding: 10px;
                    border: 2px solid #e11d48;
                    background-color: #fff5f5;
                    border-radius: 8px;
                    color: #c53030;
                }
                .status-box p { margin: 2px 0; font-size: 12px; }

                .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; }
              </style>
            </head>
            <body>
              ${statusWatermark}
              <div class="header">
                <h1>${shopInfo.name}</h1>
                <p>${shopInfo.address}</p>
                <p>${shopInfo.phone}</p>
              </div>

              ${statusInfoBox}

              <div class="invoice-details">
                <p><span>Order ID:</span> <span style="font-weight: bold;">#${order.id.slice(-6).toUpperCase()}</span></p>
                <p><span>Date:</span> <span>${new Date(order.date).toLocaleString()}</span></p>
              </div>

              ${customerHtml}

              <table>
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th style="text-align: right;">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="totals">
                <div class="row">
                  <span>Subtotal</span>
                  <span>৳${subTotalVal.toFixed(2)}</span>
                </div>
                ${discountHtml}
                ${taxHtml}
                <div class="row total">
                  <span>Total Paid</span>
                  <span>৳${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="payment-section invoice-details" style="border-bottom: none;">
                 ${paymentDetailsHtml}
              </div>

              <div class="footer">
                <p>${shopInfo.footerMessage}</p>
                <p>Generated by MyPOS App</p>
              </div>
            </body>
          </html>
        `;
    },

    printOrder: async (order: Order) => {
        try {
            const html = pdfService.generateHtml(order);

            // Directly opens the print dialog for the generated HTML.
            await Print.printAsync({
                html,
                // Optional: You can specify printer URL, orientation, etc.
                // printerUrl: 'your-printer-url', // For network printers
            });

        } catch (error) {
            console.error('Error printing receipt:', error);
        }
    }
};
