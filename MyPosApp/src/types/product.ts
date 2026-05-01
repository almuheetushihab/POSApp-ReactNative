export interface Product {
    id: string;
    name: string;
    price: number;
    purchasePrice?: number; // Added for tracking cost of goods
    category: string;
    image?: string;
    stock: number;
    barcode?: string;
    sku?: string;
}

export interface ProductResponse {
    success: boolean;
    data: Product[];
    message?: string;
}
