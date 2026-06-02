export interface User {
    id: number;
    total_points: number;

    nis?: string;
    nip?: string;
    class?: string;

    name: string;
    email: string;

    role: "student" | "teacher" | "admin" | "external";
    role_name: string;

    barcode: string | null;

    student?: {
        id: number;
        nis: string;
        gender: "male" | "female";
        status: string;
    };

    teacher?: {
        id: number;
        nip: string;
        subject: string;
        phone: string | null;
    };

    has_late_borrowings: boolean;
    current_borrowings_count: number;
    max_borrow_limit: number;
    can_borrow_more: boolean;
    remaining_quota: number;

    borrowed_books: BorrowedBook[];
}

export interface BorrowedBook {
    id: number;
    borrowed_at: string | null;
    due_date: string;
    status: string;

    book_item: {
        id: number;
        barcode: string | null;
        condition: string | null;
    } | null;

    book: {
        id: number;
        title: string;
        author: string | null;
        publisher: string | null;
    } | null;
}

export interface PhysicalBook {
    id: number;
    title: string;
    author: string | null;
    publisher: string | null;
    isbn: string | null;
    cover_image: string | null;
    location_rack: string | null;
    stock: number;
    book_items?: BookItem[];
}

export interface BookItem {
    id: number;
    barcode: string;
    status: "available" | "borrowed" | "lost" | "damaged";
    physical_book_id: number;
    physical_book?: PhysicalBook;
}

export interface SelectedBookItem extends BookItem {
    physical_book: PhysicalBook;
}

export interface BorrowingForm {
    user_id: number | null;
    book_item_ids: number[];
    due_date: string;
}

export interface ScanResult {
    success: boolean;
    message?: string;
    user?: User;
    book_item?: SelectedBookItem;
}
