export interface Visit {
    id: number | string | any;
    type: any;
    time: string;
    created_at: string;
    user_name: string;
    point_period_name: string;
}

export interface VisitPageProps {
    activities: Visit[];
    userBarcode: string | null;
    userBarcodeHtml: string | null;
    userName: string;
    userPoints: number;
}
