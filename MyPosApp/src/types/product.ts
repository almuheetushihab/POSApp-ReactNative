export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    barcode?: string;
    description?: string;
    storeId: string; // Which store this product belongs to
}