// resources/js/Pages/Admin/Uploads/Teachers/TeacherUpload.tsx

import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";

import { Card, CardContent } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

import SingleTeacherForm from "../components/SingleTeacherForm";
import MultipleTeacherUpload from "../components/MultipleTeacherUpload";

import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Alert, AlertDescription } from "@/Components/ui/alert";

interface PageProps {
    flash: {
        success?: string;
        error?: string;
        importErrors?: string[];
    };
}

export default function TeacherUpload() {
    const [activeTab, setActiveTab] = useState("single");
    const page = usePage().props;
    const flash = page.flash as any;

    return (
        <AdminLayout>
            <Head title="Tambah Guru" />

            <div className="space-y-6">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-glow p-6 text-white">
                    <h1 className="text-2xl font-bold">Tambah Data Guru</h1>
                    <p className="mt-2 opacity-90">
                        Tambah guru baru secara manual atau import dari file
                        Excel
                    </p>
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
                                <SingleTeacherForm />
                            </TabsContent>

                            <TabsContent value="multiple" className="p-6">
                                <MultipleTeacherUpload />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
