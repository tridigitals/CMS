import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { getTagColumns, Tag } from "./columns";

interface Props extends PageProps {
  tags: Tag[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Tags", href: "/tags" },
];

const TagsIndex: React.FC<Props> = ({ tags }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tag Management" />
      <div className="mt-8 mx-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tag Management</h1>
          <Link
            href="/tags/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Tag
          </Link>
        </div>
        <DataTable
          columns={getTagColumns()}
          data={tags}
          searchKey="name"
          placeholder="Search tags..."
        />
      </div>
    </AppLayout>
  );
};

export default TagsIndex;
