import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";

import { Card, CardContent } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Alert, AlertDescription } from "@/Components/ui/alert";

import SingleStudentForm from "../components/SingleStudentForm";
import MultipleStudentUpload from "../components/MultipleStudentUpload";

import { AdminLayout } from "@/Layouts/AppShellAdmin";

interface ClassData {
    id: number;
    name: string;
    level: number;
    enrollments_count?: number;
}

interface AcademicYear {
    id: number;
    name: string;
    is_active: boolean;
}

interface Props {
    classes: ClassData[];
    academicYears: AcademicYear[];
    activeAcademicYear: AcademicYear | null;
}

interface PageProps {
    flash: {
        success?: string;
        error?: string;
        importErrors?: string[];
    };
}

export default function StudentUpload({
    classes,
    academicYears,
    activeAcademicYear,
}: Props) {
    const [activeTab, setActiveTab] = useState("single");

    const page = usePage().props;
    const flash = page.flash as any;

    return (
        <AdminLayout>
            <Head title="Tambah Siswa" />

            <div className="space-y-6">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-glow p-6 text-white">
                    <h1 className="text-2xl font-bold">Tambah Data Siswa</h1>

                    <p className="mt-2 opacity-90">
                        Tambah siswa baru secara manual atau import dari file
                        Excel
                    </p>
                </div>

                {/* Tabs */}
                <Card>
                    <CardContent className="p-0">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <div className="border-b px-6">
                                <TabsList className="bg-transparent">
                                    <TabsTrigger
                                        value="single"
                                        className="data-[state=active]:border-primary data-[state=active]:text-primary"
                                    >
                                        Single Upload
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="multiple"
                                        className="data-[state=active]:border-primary data-[state=active]:text-primary"
                                    >
                                        Multiple Upload
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="single" className="p-6">
                                <SingleStudentForm
                                    classes={classes}
                                    academicYears={academicYears}
                                    activeAcademicYear={activeAcademicYear}
                                />
                            </TabsContent>

                            <TabsContent value="multiple" className="p-6">
                                <MultipleStudentUpload
                                    classes={classes}
                                    academicYears={academicYears}
                                    activeAcademicYear={activeAcademicYear}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
