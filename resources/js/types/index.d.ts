export interface User {
    id: string;
    store: Store;
    notifications: Notification
    email: string;
    email_verified_at: string;
}

export interface Notification {
    id: string,
    data: {
        message: string;
        fileName?: string;
    };
    read_at : Date,
}

export interface Store {
    id: string;
    store_name: string;
    user_id: string;
    phone_no: any;
    address: string;
    created_at: Date;
    updated_at: Date;
}

export interface Product {
    id: string;
    product_name: string;
    barcode: string;
    created_at: Date;
    updated_at: Date;
    stock: number;
    type: string;
    quantity: number;
    price: number;
    total_price: number;
    pictureBase64: string;
    category_id : string;
    category: Category | null;
    discount: Discount | null;
}

export interface ProductTransaction {
    id: string;
    product_name: string;
    barcode: string;
    created_at: Date;
    updated_at: Date;
    stock: number;
    quantity: number;
    price: number;
    total_price: number;
    pictureBase64: string;
    category: Category | null;
    discount: Discount | null;
    transaction_details : TransactionDetail[];
    purchase_details: PurchaseDetail[];
}

export interface TransactionDetail {
    id: string;
    transaction_id: string;
    quantity: number;
    discount: number;
    price: number;
    total_price: number;
    product: Product;
    created_at: Date;
    updated_at: Date;
}

export interface Transaction {
    id: string;
    transaction_details: TransactionDetail[];
    transaction_date: Date;
    payment_method: any;
    subtotal: number;
    ppn: number;
    status: string;
    total_payment: number;
    created_at: Date;
    updated_at: Date;
}

export interface PurchaseDetail {
    id: string;
    purchase_id: string;
    quantity: number;
    discount: number;
    price: number;
    total_price: number;
    product: Product;
    created_at: Date;
    updated_at: Date;
}


export interface Purchase {
    id: string;
    supplier_id: string;
    purchase_date: Date;
    purchase_details: PurchaseDetail[];
    payment_method: any;
    subtotal: number;
    ppn: number;
    status: string;
    total_payment: number;
    created_at: Date;
    updated_at: Date;
    supplier : Supplier | null;
}

export interface HoldTransaction {
    id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
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
    phone_no: number;
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

export interface ChartDataProps {
    labels: string[];
    datasets: {
        label: string;
        backgroundColor: string[] | string;
        borderColor: string[] | string;
        borderWidth: number;
        data: any[];
    }[];
}

export interface ClaimCustomer {
    id : string;
    transaction: Transaction;
    product: Product;
    quantity: number;
    status: string;
    description : string;
    created_at : Date;
    updated_at : Date;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    title: string;
    auth: {
        user: User;
    };
    notifications: Notification[];
    purchase: Purchase;
    transaction: Transaction;
    transactions: Transaction[];
    claimcustomers: ClaimCustomer[];
    claimcustomer: ClaimCustomer;
    products: Product[];
    discounts: Discount[];
    product: Product;
    categories: Category[];
    suppliers: Supplier[];
    supplier: Supplier;
    pagination: Pagination;
    search: string;
    flash: Flash;
    start_date: Date;
    end_date: Date;
    status: string;
    category: string;
};
