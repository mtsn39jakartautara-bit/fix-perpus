export interface ClassRoom {
    id: number;
    name: string;
    level: number;
    created_at: string;
    updated_at: string;
}

export interface AcademicYear {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface StudentFormData {
    name: string;
    email: string;
    nis: string;
    gender: "male" | "female";
    class_id: number;
    academic_year_id: number;
    parent_phone?: string;
    address?: string;
}

export interface BulkStudentImport {
    file: File;
    class_id: number;
    academic_year_id: number;
}

export interface StudentTemplate {
    name: string;
    email: string;
    nis: string;
    gender: string;
    parent_phone?: string;
    address?: string;
}
