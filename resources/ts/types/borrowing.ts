export interface Borrowing {
    id: number | string | any;
    book_title: string;
    book_author: string;
    book_cover: string | null;
    barcode: string;
    borrowed_at: string;
    due_date: string;
    returned_at: string | null;
    status: "borrowed" | "returned" | "late";
    fine_amount: number;
    fine_paid: boolean;
    is_overdue: boolean;
    days_left: number | null;
}

export interface BorrowingStats {
    total_borrowed: number;
    total_returned: number;
    total_late: number;
    total_fine: number;
}
