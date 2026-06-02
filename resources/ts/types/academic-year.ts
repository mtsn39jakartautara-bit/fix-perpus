export interface AcademicYear {
    id: number | string | any;
    name: string;
    is_active: boolean;
    students_count?: number;
    created_at: string;
    updated_at: string;
}
