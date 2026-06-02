// resources/js/types/return-admin.ts

export interface BorrowedBookReturn {
    id: number;
    borrowed_at: string;
    due_date: string;
    status: string;
    fine: number;
    is_late: boolean;
    days_late: number;
    book_item: {
        id: number;
        barcode: string;
        condition: string | null;
    };
    book: {
        id: number;
        title: string;
        author: string;
        publisher: string;
        cover_image?: string;
    };
}

export interface UserReturn {
    id: number;
    name: string;
    email: string;
    role: string;
    role_name: string;
    barcode: string;
    student?: {
        nis: string;
    };
    teacher?: {
        nip: string;
    };
    borrowed_books: BorrowedBookReturn[];
    total_borrowed: number;
    nis?: string;
    nip?: string;
    class?: string;
    total_points?: number;
}
