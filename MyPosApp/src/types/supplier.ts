export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    createdAt: string;
}

export interface SupplierResponse {
    success: boolean;
    data: Supplier[];
    message?: string;
}
