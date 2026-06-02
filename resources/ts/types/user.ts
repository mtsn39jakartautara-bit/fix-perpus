export interface User {
    id: number | string | any;
    barcode: string | null;
    role: "student" | "teacher" | "admin" | "external";
    name: string;
    email: string;
    total_points: number;
    created_at: string;
    updated_at: string;
    student?: {
        id: number;
        nis: string;
        gender: string;
        parent_phone: string | null;
        address: string | null;
        status: string;
        current_class?: {
            id: number;
            name: string;
            level: number;
        } | null;
        academic_year?: {
            id: number;
            name: string;
        } | null;
    } | null;
    teacher?: {
        id: number;
        nip: string;
        subject: string;
        phone: string | null;
        address: string | null;
    };
    external?: {
        id: number;
        nik: string;
        number_phone: string | null;
        address: string | null;
    };
}
