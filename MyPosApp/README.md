# 🛒 MyPOS - Professional Point of Sale App

MyPOS is a modern, fast, and feature-rich Point of Sale (POS) application built with React Native (Expo) for Android, iOS, and Web. It is designed to run efficiently even in completely offline environments, making it a perfect solution for small to medium-sized retail shops, cafes, and mobile businesses.

## 🚀 Key Features

### 1. 🔐 Role-Based Access Control (RBAC) & Security
* **Multiple Roles:** Supports Admin, Manager, and Cashier roles.
* **Access Permissions:** 
    * **Admin:** Full access (View analytics, manage products, change settings, clear history, process full refunds).
    * **Manager:** Can view analytics and products, process refunds, but cannot clear sales history or access settings.
    * **Cashier:** Can only access the POS sales terminal and view history (No delete/refund/analytics).
* **PIN Authentication:** Fast and secure 4-digit PIN login mechanism.

### 2. ⚡ Advanced POS Terminal
* **Smart Search:** Search products by Name, SKU, or Barcode.
* **Barcode Scanner:** Built-in camera scanner to quickly add items to the cart.
* **Category Filtering:** Quickly filter products by predefined categories (Food, Drinks, Snacks, etc.).
* **Real-time Cart Management:** Instantly update quantities, calculate subtotals, and remove items.

### 3. 💳 Flexible Payment Processing
* **Multiple Payment Methods:** Support for Cash, Card, and Mobile Financial Services (MFS - e.g., bKash, Nagad).
* **Split Payments:** Customers can pay partially in Cash, Card, and MFS within a single order.
* **Dynamic Validation:** Requires exact total match for split payments, 4-digit verification for cards, and 11-digit verification for MFS.
* **Change Calculator:** Auto-calculates return change if the received cash is higher than the total due.

### 4. 🧮 Dynamic Discounts & Tax Engine
* **Smart Discounts:** Apply Fixed Amount (৳) or Percentage (%) discounts per order.
* **VAT/Tax Engine:** Configurable tax rates (e.g., 5%, 15%).
* **Tax Types:** Support for both **Inclusive Tax** (tax is inside the product price) and **Exclusive Tax** (tax is added on top of the subtotal).

### 5. 🔁 Refund, Return & Exchange System
* **Full Refunds:** Admins/Managers can fully refund an order, immediately reflecting on daily sales reports.
* **Returns:** Log returned items with customizable reasons (e.g., "Defective item").
* **Exchanges:** Process product exchanges by calculating the price difference (whether the customer owes money or the shop needs to return change).

### 6. 📊 Dashboard & Analytics
* **Real-time Metrics:** View Today's Sales, Total Orders, and Product Count.
* **Sales Charts:** Visual representation of sales data using Native Chart Kits.
* **Quick Actions:** Fast navigation to POS, Products, History, and Settings.

### 7. 🧾 Receipt Generation & Printing
* **PDF Invoices:** Generates beautiful, professional PDF receipts for every sale.
* **Customizable Footer:** Shop name, address, phone, and footer messages are configurable via Settings.
* **Detailed Breakdown:** Receipts show exact split payment methods (e.g., Card ending in **4242), discounts, and tax breakdowns.
* **Print/Share:** Send receipts directly to a Thermal Printer or share via WhatsApp/Email.

### 8. 🌐 Multi-Language & Theming
* **i18n Support:** Fully translated in English and Bengali (বাংলা).
* **Dark Mode:** System-wide Light and Dark mode with a seamless toggle switch.

---

## 🛠️ Technology Stack

* **Framework:** React Native & Expo Router (File-based routing)
* **Styling:** NativeWind (Tailwind CSS for React Native)
* **State Management:** Zustand (Fast, scalable, and immutable)
* **Local Storage:** AsyncStorage (Offline-first architecture)
* **Icons:** Expo Vector Icons (Ionicons)
* **PDF & Printing:** `expo-print` and `expo-sharing`
* **Localization:** `react-i18next`

### Why these technologies?
* **Zustand + AsyncStorage:** Used instead of Redux/Context for much faster read/write times without complex boilerplate. It enables the app to run completely offline.
* **NativeWind:** Provides consistent UI design across all devices while significantly reducing stylesheet size.
* **Expo Router:** Makes deep-linking and screen navigation much more intuitive and maintainable.

---

## 🧪 Demo Accounts

To test the application, use the following PIN codes at the login screen:
* **Admin:** `0000` (Full Access)
* **Manager:** `1234` (Cannot clear history or access settings)
* **Cashier:** `1111` (Can only access POS terminal and view history)

---

## 🔮 Future Roadmap (Upcoming Features)

1. **Inventory & Stock Management Module**
   * Low stock alerts and threshold configurations.
   * Supplier management and purchase order tracking.
2. **Cloud Synchronization & Backend DB**
   * Sync offline data with Firebase/Supabase when the internet is restored.
   * Multi-device synchronization for larger stores with multiple cashiers.
3. **Advanced Customer CRM**
   * Customer loyalty points and rewards system.
   * Purchase history per specific customer.
4. **Employee Management**
   * Shift tracking (Clock-in / Clock-out).
   * Cash drawer reconciliation at the end of shifts.
5. **Hardware Integrations**
   * Direct ESC/POS Bluetooth thermal printer integration (without PDF).
   * Cash drawer trigger via RJ11 interface.
6. **Multi-Store Architecture**
   * Manage multiple branches from a single Admin dashboard.

---

## 👨‍💻 Installation & Running Locally

1. Clone the repository.
2. Navigate to the project folder (`cd POSApp-ReactNative/MyPosApp`).
3. Install dependencies: `npm install`
4. Start the Expo server: `npx expo start`
5. Press `a` to open in Android Emulator, `i` for iOS Simulator, or scan the QR code with your physical device using the Expo Go app.