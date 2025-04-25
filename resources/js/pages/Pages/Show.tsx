import React from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";

interface Props extends PageProps {
    page: {
        id: number;
        title: string;
        slug: string;
        content: string;
        meta_description: string;
        meta_keywords: string;
        status: 'draft' | 'published';
        editor_type: 'classic' | 'pagebuilder';
        author: {
            name: string;
        };
        created_at: string;
        updated_at: string;
        featured_image_url: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pages", href: "/pages" },
    { title: "View Page", href: "#" },
];

const PagesShow: React.FC<Props> = ({ page }) => {
    return (
        <AppLayout
            title="View Page"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    View Page
                </h2>
            )}
            breadcrumbs={breadcrumbs}
        >
            <Head title="View Page" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Header Section */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {page.title}
                                    </h1>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Slug: {page.slug}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Link href={`/pages/${page.id}/edit`}>
                                        <Button variant="outline">Edit Page</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <span>By {page.author.name}</span>
                                <span className="mx-2">•</span>
                                <span>Created: {page.created_at}</span>
                                <span className="mx-2">•</span>
                                <span>Last updated: {page.updated_at}</span>
                                <span className="mx-2">•</span>
                                <span className="capitalize">Status: {page.status}</span>
                                <span className="mx-2">•</span>
                                <span className="capitalize">Editor: {page.editor_type}</span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {page.featured_image_url && (
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <img
                                    src={page.featured_image_url}
                                    alt={page.title}
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>
                        )}

                        {/* Meta Information */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Meta Information
                            </h2>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">Description: </span>
                                    {page.meta_description}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Keywords: </span>
                                    {page.meta_keywords}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Content
                            </h2>
                            {page.editor_type === 'classic' ? (
                                <div 
                                    className="prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                />
                            ) : (
                                <div 
                                    className="gjs-content"
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PagesShow;
