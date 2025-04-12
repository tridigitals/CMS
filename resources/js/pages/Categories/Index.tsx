import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { getCategoryColumns, Category } from "./columns";

interface Props extends PageProps {
  categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Categories", href: "/categories" },
];

const CategoriesIndex: React.FC<Props> = ({ categories }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Category Management" />
      <div className="mt-8 mx-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Category Management</h1>
          <Link
            href="/categories/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Category
          </Link>
        </div>
        <DataTable
          columns={getCategoryColumns()}
          data={categories}
          searchKey="name"
          placeholder="Search categories..."
        />
      </div>
    </AppLayout>
  );
};

export default CategoriesIndex;
