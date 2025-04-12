import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { getPostColumns, Post } from "./columns";

interface Props extends PageProps {
  posts: Post[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Posts", href: "/posts" },
];

const PostsIndex: React.FC<Props> = ({ posts }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Post Management" />
      <div className="mt-8 mx-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Post Management</h1>
          <Link
            href="/posts/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Post
          </Link>
        </div>
        <DataTable
          columns={getPostColumns()}
          data={posts}
          searchKey="title"
          placeholder="Search posts..."
        />
      </div>
    </AppLayout>
  );
};

export default PostsIndex;
