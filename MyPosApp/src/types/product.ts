export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    stock: number;
}

export interface ProductResponse {
    success: boolean;
    data: Product[];
    message?: string;
}