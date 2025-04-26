import React from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import * as dateFnsTz from "date-fns-tz";

interface Props extends PageProps {
  page: {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_description: string;
    meta_keywords: string;
    status: string;
    editor_type: string;
    created_at: string;
    updated_at: string;
    featured_image_url?: string | null;
    author: {
      name: string;
    };
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Pages", href: "/pages" },
  { title: "View Page", href: "#" },
];

const PagesShow: React.FC<Props> = ({ page }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={page.title}>
        <meta name="description" content={page.meta_description} />
        <meta name="keywords" content={page.meta_keywords} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.meta_description} />
        {page.featured_image_url && (
          <meta property="og:image" content={page.featured_image_url} />
        )}
        <meta property="og:type" content="article" />
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="overflow-hidden">
          {page.featured_image_url && (
            <div className="w-full h-[400px] relative">
              <img
                src={page.featured_image_url}
                alt={page.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div>
                Published: {format(
                  dateFnsTz.toZonedTime(new Date(page.created_at), 'Asia/Jakarta'),
                  'MMMM d, yyyy HH:mm (zzz)'
                )}
              </div>
              <div>Author: {page.author.name}</div>
            </div>
            <div className="mt-8 prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Status:</span> {page.status}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {format(
                  dateFnsTz.toZonedTime(new Date(page.updated_at), 'Asia/Jakarta'),
                  'MMMM d, yyyy HH:mm (zzz)'
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PagesShow;
