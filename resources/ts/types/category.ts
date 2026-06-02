export interface Category {
    id: number | string | any;
    name: string;
    slug: string;
    books_count?: number;
    created_at: string;
    updated_at: string;
}
