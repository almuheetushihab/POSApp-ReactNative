import {Order} from "../types/order";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const pdfService = {

    // ১. এইচটিএমএল টেমপ্লেট জেনারেট করা
    generateHtml: (order: Order) => {
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

        // আইটেম লিস্ট লুপ করা
        const itemsHtml = order.items.map(item => `
      <tr class="item">
        <td>${item.name}<br><span class="subtitle">Qty: ${item.quantity}</span></td>
        <td style="text-align: right;">৳${item.price * item.quantity}</td>
      </tr>
    `).join('');

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
            .invoice-details p { margin: 2px 0; font-size: 12px; display: flex; justify-content: space-between; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; font-size: 12px; border-bottom: 1px solid #ddd; padding: 5px 0; }
            td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
            .item td { vertical-align: top; }
            .subtitle { font-size: 10px; color: #888; }
            
            .totals { margin-top: 20px; }
            .totals .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
            .totals .total { font-weight: bold; font-size: 18px; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
            
            .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MyPOS Store</h1>
            <p>Dhaka, Bangladesh</p>
            <p>+880 1712 345678</p>
          </div>

          <div class="invoice-details">
            <p><span>Order ID:</span> <span>#${order.id.slice(-6).toUpperCase()}</span></p>
            <p><span>Date:</span> <span>${new Date(order.date).toLocaleString()}</span></p>
            <p><span>Method:</span> <span>${order.paymentMethod}</span></p>
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

          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Powered by MyPOS App</p>
          </div>
        </body>
      </html>
    `;
    },

    // ২. প্রিন্ট বা শেয়ার করার ফাংশন
    printOrder: async (order: Order) => {
        try {
            const html = pdfService.generateHtml(order);

            // ফাইল জেনারেট করা
            const { uri } = await Print.printToFileAsync({ html });
            console.log('File has been saved to:', uri);

            // শেয়ার ডায়ালগ ওপেন করা (যেখান থেকে প্রিন্টও করা যায়)
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }
};