export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface WishlistBook {
    id: number;
    uuid: string;
    title: string;
    author: string | null;
    publisher: string | null;
    publish_year: number | null;
    abstract: string | null;
    categories: Category[];
    wishlist_count: number;
}

export interface Wishlist {
    id: number | string | any;
    notes: string | null;
    priority: number;
    priority_label: {
        label: string;
        color: string;
    };
    created_at: string;
    book: WishlistBook;
}

export interface WishlistStats {
    total: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
}
