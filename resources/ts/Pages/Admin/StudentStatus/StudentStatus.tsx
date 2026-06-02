// resources/js/Pages/Admin/StudentStatus/StudentStatus.tsx

import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";

import { Card, CardContent } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Alert, AlertDescription } from "@/Components/ui/alert";

import SingleStatusChange from "./components/SingleStatusChange";
import MultipleStatusChange from "./components/MultipleStatusChange";

import { AdminLayout } from "@/Layouts/AppShellAdmin";

interface ClassData {
    id: number;
    name: string;
    level: number;
}

interface AcademicYear {
    id: number;
    name: string;
    is_active: boolean;
}

interface Props {
    statuses: any;
    classes: ClassData[];
    activeAcademicYear: AcademicYear | null;
}

interface PageProps {
    flash: {
        success?: string;
        error?: string;
        importErrors?: string[];
    };
}

export default function StudentStatus({
    statuses,
    classes,
    activeAcademicYear,
}: Props) {
    const [activeTab, setActiveTab] = useState("single");
    const page = usePage().props;
    const flash = page.flash as any;

    return (
        <AdminLayout>
            <Head title="Ubah Status Siswa" />

            <div className="space-y-6">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-glow p-6 text-white">
                    <h1 className="text-2xl font-bold">Ubah Status Siswa</h1>
                    <p className="mt-2 opacity-90">
                        Ubah status siswa menjadi Pindah Sekolah atau Drop Out
                    </p>
                    {activeAcademicYear && (
                        <p className="mt-2 text-sm opacity-80">
                            Tahun Ajaran Aktif:{" "}
                            <strong>{activeAcademicYear.name}</strong>
                        </p>
                    )}
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="bg-mint border-primary/20">
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert className="bg-peach border-primary/20">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {flash?.importErrors && flash.importErrors.length > 0 && (
                    <Alert className="bg-peach border-primary/20">
                        <AlertDescription>
                            <div className="font-semibold mb-2">
                                Detail Error:
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {flash.importErrors
                                    .slice(0, 10)
                                    .map((error: string, index: number) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                {flash.importErrors.length > 10 && (
                                    <li>
                                        ... dan {flash.importErrors.length - 10}{" "}
                                        error lainnya
                                    </li>
                                )}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

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
                                        Single Update
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="multiple"
                                        className="data-[state=active]:border-primary data-[state=active]:text-primary"
                                    >
                                        Multiple Update
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="single" className="p-6">
                                <SingleStatusChange statuses={statuses} />
                            </TabsContent>

                            <TabsContent value="multiple" className="p-6">
                                <MultipleStatusChange statuses={statuses} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
