# MyPosAjapp - Professional Point of Sale (POS) System

MyPosApp is a comprehensive, feature-rich Point of Sale (POS) system built with React Native and Expo. It is designed to be versatile and support various business types, including electronics, fashion, pharmacies, and grocery stores, through a dynamic product attribute system.

## ✨ Key Features

- **Core POS Functionality:**
    - **New Sale Processing:** Efficiently handle new sales transactions.
    - **Dynamic Product Attributes:** Manage products with category-specific attributes (e.g., Serial Numbers, Warranty for Electronics; Size, Color for Fashion; Expiry Date, Batch Number for Pharmacy; Weight, Brand for Grocery).
    - **Cart Management:** Add/remove items, adjust quantities, and manage product attributes within the cart.
    - **Customer Management:** Add customer details (name, phone) to orders, with search and selection functionality.
    - **Discount & Tax Application:** Apply fixed or percentage-based discounts and configure inclusive/exclusive tax/VAT settings.
    - **Payment Processing:** Support for various payment methods (Cash, Card, MFS, Split Payment) with detailed transaction recording.

- **Inventory Management:**
    - **Product Listing & Search:** View, search, and filter products by category.
    - **Add/Edit/Delete Products:** Full CRUD operations for product management, including dynamic attribute input.
    - **Real-time Stock Tracking:** Inventory updates automatically with sales, returns, and exchanges.
    - **Supplier Management:** Track and manage supplier information.
    - **Purchase Order System:** Create and manage purchase orders for inventory restocking.

- **Order & Transaction History:**
    - **Sales History:** View a comprehensive list of all past orders.
    - **Order Status Tracking:** Clearly see order statuses (Completed, Refunded, Returned, Partial Return, Exchanged).
    - **Return & Exchange Management:**
        - **Partial Returns:** Process returns for specific items or quantities within an order.
        - **Inventory Restoration:** Automatically restore stock for returned items.
        - **Exchange Workflow:** Handle product exchanges, including price difference calculation and payment adjustments.
        - **Refund Processing:** Full refund functionality with inventory adjustments.

- **Reporting & Analytics:**
    - **Sales & Profit Reports:** Generate detailed reports on total revenue, total orders, average order value, and profit margins.
    - **Top Selling Products:** Identify best-performing products.
    - **Time-based Filtering:** View reports for Today, This Week, or This Month.

- **User & Security Management:**
    - **Role-Based Access Control (RBAC):** Restrict access to certain features (e.g., analytics, settings) based on user roles (Admin, Manager, Cashier).
    - **Secure Logout:** Ensure secure session termination.

- **Data Management & Backup:**
    - **Local Data Storage:** Utilizes AsyncStorage for robust local data persistence.
    - **Backup & Restore:** Functionality to backup and restore application data.

- **User Interface & Experience:**
    - **Modern & Intuitive Design:** Clean and user-friendly interface.
    - **Multi-language Support:** Fully localized for English (en) and Bengali (bn) using i18next, with dynamic language switching.
    - **Light & Dark Mode:** Seamless switching between light and dark themes for optimal viewing comfort.
    - **Toast Notifications:** Provide clear feedback for user actions.
    - **Network Status Detection:** Inform users about their online/offline status.

- **Hardware & External Integration:**
    - **Receipt Printing:** Generate and print professional sales receipts with detailed order information, including attributes and status.
    - **Barcode Scanning:** Quickly add products to the cart using the device camera.

## 🚀 Tech Stack

- **Framework:** React Native with Expo (SDK 51)
- **Routing:** Expo Router
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** NativeWind (Tailwind CSS)
- **Localization:** i18next, intl-pluralrules
- **Data Persistence:** AsyncStorage
- **PDF Generation:** Expo Print
- **Network Info:** @react-native-community/netinfo

## 🏁 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- An Android Emulator or a physical Android device
- Android Studio (for setting up JDK and emulators)

### Installation & Running

1.  **Navigate to the project directory:**
    ```sh
    cd MyPosApp
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set JAVA_HOME environment variable:**
    Ensure your `JAVA_HOME` environment variable is set to your JDK installation path (e.g., `C:\Program Files\Android\Android Studio\jbr`). Restart your terminal after setting.

4.  **Run the application:**
    ```sh
    npx expo start
    ```
    This will start the Metro bundler. You can then run the app on an Android emulator or your physical device using the Expo Go app.

### Building an APK for Android

To create a standalone APK file for distribution or direct installation:

1.  **Install EAS CLI globally:**
    ```sh
    npm install -g eas-cli
    ```

2.  **Log in to your Expo account:**
    ```sh
    eas login
    ```
    Follow the browser prompts to log in.

3.  **Configure EAS Build (if not already configured):**
    ```sh
    eas build:configure
    ```
    Ensure your `eas.json` includes `"buildType": "apk"` under the `production` profile for Android.

4.  **Start the APK build process:**
    ```sh
    eas build --platform android --profile production
    ```
    When prompted to generate a new Android Keystore, choose "Yes" and let EAS handle it. The build will run in the cloud, and you will receive a link to download your APK once completed.

---

This project is continuously being enhanced to provide a robust and flexible POS solution for various business needs.
