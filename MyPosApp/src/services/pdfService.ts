import {Order, PaymentMethod} from "../types/order";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
             paymentDetailsHtml = `<p style="font-weight: bold; margin-top: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Split Payment Breakdown:</p>`;
             
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

        return `
          <html>
          
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
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
                
                .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${shopInfo.name}</h1>
                <p>${shopInfo.address}</p>
                <p>${shopInfo.phone}</p>
              </div>

              <div class="invoice-details">
                <p><span>Order ID:</span> <span style="font-weight: bold;">#${order.id.slice(-6).toUpperCase()}</span></p>
                <p><span>Date:</span> <span>${new Date(order.date).toLocaleString()}</span></p>
              </div>

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
                  <span>৳${order.totalAmount}</span>
                </div>
                <div class="row">
                  <span>VAT (0%)</span>
                  <span>৳0</span>
                </div>
                <div class="row total">
                  <span>Total Paid</span>
                  <span>৳${order.totalAmount}</span>
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

            const {uri} = await Print.printToFileAsync({html});
            console.log('File has been saved to:', uri);

            await Sharing.shareAsync(uri, {UTI: '.pdf', mimeType: 'application/pdf'});
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }
};