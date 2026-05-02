import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useProductStore } from '../store/useProductStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useOrderStore } from '../store/useOrderStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useSupplierStore } from '../store/useSupplierStore';
import { usePurchaseOrderStore } from '../store/usePurchaseOrderStore';

// A function to get all data from the stores
const getAllData = () => {
    const { products } = useProductStore.getState();
    const { customers } = useCustomerStore.getState();
    const { orders } = useOrderStore.getState();
    const { shopInfo, taxSettings } = useSettingsStore.getState();
    const { suppliers } = useSupplierStore.getState();
    const { purchaseOrders } = usePurchaseOrderStore.getState();

    return {
        products,
        customers,
        orders,
        shopInfo,
        taxSettings,
        suppliers,
        purchaseOrders,
        backupVersion: '1.0',
        backupDate: new Date().toISOString(),
    };
};

// A function to restore data to the stores using proper actions
const restoreAllData = (data: any) => {
    if (data.products) useProductStore.getState().setProducts(data.products);
    if (data.customers) useCustomerStore.getState().setCustomers(data.customers);
    if (data.orders) useOrderStore.getState().setOrders(data.orders);
    if (data.suppliers) useSupplierStore.getState().setSuppliers(data.suppliers);
    if (data.purchaseOrders) usePurchaseOrderStore.getState().setPurchaseOrders(data.purchaseOrders);

    // For settings, we use the existing update actions
    if (data.shopInfo) useSettingsStore.getState().updateShopInfo(data.shopInfo);
    if (data.taxSettings) useSettingsStore.getState().updateTaxSettings(data.taxSettings);
};

export const BackupService = {
    // Creates a JSON backup file and opens the share dialog
    backupData: async () => {
        try {
            // --- DEBUGGING STEP ---
            console.log("--- [DEBUG] Inspecting FileSystem Module ---");
            console.log("FileSystem Object:", FileSystem);
            console.log("Document Directory:", (FileSystem as any).documentDirectory);
            console.log("Cache Directory:", (FileSystem as any).cacheDirectory);
            console.log("--- [END DEBUG] ---");
            // --- END DEBUGGING STEP ---

            const data = getAllData();
            const jsonString = JSON.stringify(data, null, 2);
            const fileName = `MyPOS_Backup_${new Date().toISOString().split('T')[0]}.json`;

            const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;
            if (!baseDir) {
                throw new Error('Could not access file system directories.');
            }
            const fileUri = baseDir + fileName;

            await FileSystem.writeAsStringAsync(fileUri, jsonString, {
                encoding: 'utf8',
            });

            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Save your backup file',
            });

            return { success: true };
        } catch (error) {
            console.error("Backup failed:", error);
            return { success: false, error };
        }
    },

    // Opens the document picker to select a backup file and restore data
    restoreData: async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
            });

            if (result.canceled) {
                return { success: false, message: 'User cancelled the file selection.' };
            }

            const fileUri = result.assets[0].uri;
            const jsonString = await FileSystem.readAsStringAsync(fileUri, {
                encoding: 'utf8',
            });

            const data = JSON.parse(jsonString);

            if (!data.backupVersion || !data.backupDate) {
                 throw new Error("Invalid or corrupted backup file.");
            }

            restoreAllData(data);

            return { success: true };
        } catch (error) {
            console.error("Restore failed:", error);
            return { success: false, error };
        }
    },
};