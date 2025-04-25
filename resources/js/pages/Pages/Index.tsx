import React, { useState } from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { getPageColumns, Page } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Props extends PageProps {
    pages: {
        published: Page[];
        draft: Page[];
        trash: Page[];
    };
    counts: {
        published: number;
        draft: number;
        trash: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pages", href: "/pages" },
];

const PagesIndex: React.FC<Props> = ({ pages, counts }) => {
    const [activeTab, setActiveTab] = useState("published");

    const handleStatusChange = (pageId: number, newStatus: string) => {
        if (confirm("Are you sure you want to change this page's status?")) {
            router.post(`/pages/${pageId}/status`, {
                status: newStatus,
            });
        }
    };

    const handleDelete = (pageId: number) => {
        if (confirm("Are you sure you want to delete this page?")) {
            router.delete(`/pages/${pageId}`);
        }
    };

    const handleRestore = (pageId: number) => {
        if (confirm("Are you sure you want to restore this page?")) {
            router.post(`/pages/${pageId}/restore`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Page Management" />
            <div className="mt-8 mx-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Page Management
                    </h2>
                    <Link href="/pages/create">
                        <Button>+ Add Page</Button>
                    </Link>
                </div>

                <Tabs defaultValue="published" className="w-full" onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="published" className="flex items-center gap-2">
                            Published
                            <Badge variant="secondary">{counts.published}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="draft" className="flex items-center gap-2">
                            Draft
                            <Badge variant="secondary">{counts.draft}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="trash" className="flex items-center gap-2">
                            Trash
                            <Badge variant="destructive">{counts.trash}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="published">
                        <DataTable
                            columns={getPageColumns({
                                onStatusChange: handleStatusChange,
                                onDelete: handleDelete,
                                showActions: true,
                                status: "published"
                            })}
                            data={pages.published}
                            searchKey="title"
                            placeholder="Search published pages..."
                        />
                    </TabsContent>

                    <TabsContent value="draft">
                        <DataTable
                            columns={getPageColumns({
                                onStatusChange: handleStatusChange,
                                onDelete: handleDelete,
                                showActions: true,
                                status: "draft"
                            })}
                            data={pages.draft}
                            searchKey="title"
                            placeholder="Search draft pages..."
                        />
                    </TabsContent>

                    <TabsContent value="trash">
                        <DataTable
                            columns={getPageColumns({
                                onRestore: handleRestore,
                                onDelete: handleDelete,
                                showRestore: true,
                                status: "trash"
                            })}
                            data={pages.trash}
                            searchKey="title"
                            placeholder="Search deleted pages..."
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default PagesIndex;
