export type ProductCategory = 'Food' | 'Drinks' | 'Snacks' | 'Electronics' | 'Fashion' | 'Pharmacy' | 'Grocery' | 'Other';

export interface Warranty {
    period: string; // "12 months"
    provider: 'Seller' | 'Brand';
}

export interface ProductAttributes {
    // Electronics
    serialNumber?: string;
    warranty?: Warranty;

    // Fashion
    size?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    color?: string;
    material?: string;

    // Pharmacy
    expiryDate?: string; // ISO 8601 format
    batchNumber?: string;
    manufacturer?: string;

    // Grocery
    weight?: string; // "500g", "1kg"
    brand?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    purchasePrice?: number;
    category: ProductCategory;
    image?: string;
    stock: number;
    barcode?: string;
    sku?: string;
    attributes?: ProductAttributes;
}

export interface ProductResponse {
    success: boolean;
    data: Product[];
    message?: string;
}
