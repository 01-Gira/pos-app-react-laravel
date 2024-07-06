export interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at: string;
}

export interface Product {
    id: string;
    product_name: string;
    barcode: string;
    created_at: Date;
    updated_at: Date;
    stock: number;
    quantity: number;
    price: number;
    discount: number;
    total_price: number;
    pictureBase64: string;
    category: Category | null;
}

export interface ProductTransactions {
    id: string;
    barcode: string;
    product_name: string;
    quantity: number;
    price: number;
    discount: number;
    total_price: number;
    category: Category | null;
}

export interface Transaction {
    id: string;
    products: Product[];
    total_price: number;
    ppn: number;
    total_payment: number;
}

export interface HoldTransaction {
    id: string;
    status: string;
    created_at: Date;
}

export interface Discount {
    id: string;
    discount: number;
    product: Product | null;
    created_at: Date;
    updated_at: Date;
}

export interface Supplier {
    id: string;
    uniq_code: string;
    supplier_name: string;
    address: string;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: string;
    category_name: string;
    created_at: Date;
    updated_at: Date;
}

export interface Pagination {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
}

export interface Session {
    message: string;
}

export interface Flash {
    type_message: String;
    message: String;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    title: string;
    auth: {
        user: User;
    };
    products: Product[];
    discounts: Discount[];
    // cashiers: Cashier[];
    product: Product;
    categories: Category[];
    suppliers: Supplier[];
    supplier: Supplier;
    pagination: Pagination;
    search: string;
    flash: Flash;
};
