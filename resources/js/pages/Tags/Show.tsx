import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageProps, BreadcrumbItem } from "@/types";

type Tag = {
  id: number;
  name: string;
  slug: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
};

interface Props extends PageProps {
  tag: Tag;
}

const breadcrumbs = (tagName: string): BreadcrumbItem[] => [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Tags", href: "/tags" },
  { title: tagName, href: "#" },
];

const TagShow: React.FC<Props> = ({ tag }) => {
  // Helper to get string from Spatie translatable (string or object)
  const getString = (val: any) =>
    typeof val === "string"
      ? val
      : val && typeof val === "object"
      ? val["en"] || Object.values(val)[0] || ""
      : "";

  return (
    <AppLayout breadcrumbs={breadcrumbs(getString(tag.name))}>
      <Head title={`Tag: ${getString(tag.name)}`} />
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 rounded-full p-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#eab308" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"/></svg>
            </div>
            <h1 className="text-2xl font-bold">Tag Detail</h1>
            <div className="flex gap-2 ml-auto">
              <Link href={`/tags/${tag.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Link href="/tags">
                <Button variant="outline">Back to List</Button>
              </Link>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-1">Tag Name</label>
            <div className="text-lg font-semibold">{getString(tag.name)}</div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-1">Slug</label>
            <div className="text-base">{getString(tag.slug)}</div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
            <div className="text-base">{tag.type || "-"}</div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TagShow;
