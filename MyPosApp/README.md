# MyPosApp - Professional Point of Sale (POS) System

MyPosApp is a comprehensive, feature-rich Point of Sale (POS) system built with React Native and Expo. It is designed to be versatile and support various business types, including electronics, fashion, pharmacies, and grocery stores, through a dynamic product attribute system.

## ✨ Key Features

- **Core POS Functionality:**
    - **New Sale Processing:** Efficiently handle new sales transactions.
    - **Dynamic Product Attributes:** Manage products with category-specific attributes (e.g., Serial Numbers for Electronics; Size, Color for Fashion; Expiry Date for Pharmacy).
    - **Cart Management:** Add/remove items, adjust quantities, and manage product attributes within the cart.
    - **Customer Management:** Add customer details (name, phone) to orders, with search and selection functionality.
    - **Discount & Tax Application:** Apply fixed or percentage-based discounts and configure tax/VAT settings.
    - **Payment Processing:** Support for various payment methods (Cash, Card, MFS, Split Payment).

- **Inventory Management:**
    - **Product Listing & Search:** View, search, and filter products by category.
    - **Add/Edit/Delete Products:** Full CRUD operations for product management.
    - **Real-time Stock Tracking:** Inventory updates automatically with sales and returns.
    - **Supplier Management:** Track and manage supplier information.
    - **Purchase Order System:** Create and manage purchase orders for inventory restocking.

- **Order & Transaction History:**
    - **Sales History:** View a comprehensive list of all past orders.
    - **Order Status Tracking:** Clearly see order statuses (e.g., Completed, Refunded).
    - **Return & Exchange Management:** Process returns and exchanges with automatic inventory restoration.

- **Reporting & Analytics:**
    - **Sales & Profit Reports:** Generate reports on revenue, total orders, and profit margins.
    - **Top Selling Products:** Identify best-performing products.
    - **Time-based Filtering:** View reports for Today, This Week, or This Month.

- **User & Security Management:**
    - **User Authentication:** Secure login and logout functionality to protect app data.
    - **Future Goal:** Implementing full Role-Based Access Control (RBAC) to create different user roles like Admin, Manager, and Cashier.

- **Data Management & Offline Sync:**
    - **Robust Offline Support:** The app is fully functional without an internet connection. All sales and data are stored locally.
    - **Automatic Syncing:** Data is automatically synchronized with the server when the internet connection is restored.
    - **Future Goal:** A manual Backup & Restore feature is planned for exporting and importing data.

- **User Interface & Experience:**
    - **Modern & Intuitive Design:** Clean and user-friendly interface.
    - **Multi-language Support:** Fully localized for English (en) and Bengali (bn).
    - **Light & Dark Mode:** Seamless switching between light and dark themes.
    - **Toast Notifications:** Provide clear feedback for user actions.
    - **Network Status Detection:** Inform users about their online/offline status.

- **Hardware & External Integration:**
    - **Receipt Printing:** Generate and print professional sales receipts using Expo Print.
    - **Barcode Scanning:** Quickly add products to the cart using the device camera.

## 🚀 Tech Stack

- **Framework:** React Native with Expo (SDK 54)
- **Routing:** Expo Router
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** NativeWind (Tailwind CSS)
- **Localization:** i18next
- **Data Persistence:** AsyncStorage
- **Offline Sync:** Custom queue system with Zustand
- **PDF Generation:** Expo Print
- **Network Info:** @react-native-community/netinfo

## 🏁 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- An Android Emulator or a physical Android device

### Installation & Running

1.  **Navigate to the project directory:**
    ```sh
    cd MyPosApp
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the application:**
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

3.  **Configure EAS Build (if not already configured):**
    ```sh
    eas build:configure
    ```

4.  **Start the APK build process:**
    ```sh
    eas build --platform android --profile production
    ```
    EAS will handle the build process in the cloud and provide a link to download your APK once completed.

---

This project is continuously being enhanced to provide a robust and flexible POS solution for various business needs.
