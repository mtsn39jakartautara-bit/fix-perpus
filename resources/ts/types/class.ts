export interface Class {
    id: number | string | any;
    name: string;
    level: number;
    enrollments_count?: number;
    students_count?: number;
    created_at: string;
    updated_at: string;
    enrollments?: Array<{
        id: number;
        student_id: number;
        academic_year_id: number;
        academicYear: {
            id: number;
            name: string;
            is_active: boolean;
        };
        student?: {
            id: number | string | any;
            nis: string;
            user: {
                id: number;
                name: string;
                email: string;
            };
        };
    }>;
}
