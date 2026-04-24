import { doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Order } from '../types/order';
import { Product } from '../types/product';
import { Customer } from '../types/customer';

const syncOrder = async (order: Order): Promise<boolean> => {
    try {
        const orderRef = doc(db, 'orders', order.id);
        await setDoc(orderRef, order, { merge: true });
        return true;
    } catch (error) {
        console.error("Failed to sync order:", error);
        return false;
    }
};

const fetchOrders = async (): Promise<Order[]> => {
    try {
        const ordersCollection = collection(db, 'orders');
        const querySnapshot = await getDocs(ordersCollection);
        return querySnapshot.docs.map(doc => doc.data() as Order);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
};

const syncProduct = async (product: Product): Promise<boolean> => {
    try {
        const productRef = doc(db, 'products', product.id);
        await setDoc(productRef, product, { merge: true });
        return true;
    } catch (error) {
        console.error("Failed to sync product:", error);
        return false;
    }
};

const fetchProducts = async (): Promise<Product[]> => {
    try {
        const productsCollection = collection(db, 'products');
        const querySnapshot = await getDocs(productsCollection);
        return querySnapshot.docs.map(doc => doc.data() as Product);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
};

const syncCustomer = async (customer: Customer): Promise<boolean> => {
    try {
        const customerRef = doc(db, 'customers', customer.id);
        await setDoc(customerRef, customer, { merge: true });
        return true;
    } catch (error) {
        console.error("Failed to sync customer:", error);
        return false;
    }
};

const fetchCustomers = async (): Promise<Customer[]> => {
    try {
        const customersCollection = collection(db, 'customers');
        const querySnapshot = await getDocs(customersCollection);
        return querySnapshot.docs.map(doc => doc.data() as Customer);
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return [];
    }
};


export const cloudSyncService = {
    syncOrder,
    fetchOrders,
    syncProduct,
    fetchProducts,
    syncCustomer,
    fetchCustomers,
};