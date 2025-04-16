import React, { useState } from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { getPostColumns, Post } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Props extends PageProps {
  posts: {
    published: Post[];
    draft: Post[];
    trash: Post[];
  };
  counts: {
    published: number;
    draft: number;
    trash: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Posts", href: "/posts" },
];

const PostsIndex: React.FC<Props> = ({ posts, counts }) => {
  const [activeTab, setActiveTab] = useState("published");

  const handleStatusChange = (postId: number, newStatus: string) => {
    if (confirm("Are you sure you want to change this post's status?")) {
      router.post(`/posts/${postId}/status`, {
        status: newStatus,
      });
    }
  };

  const handleDelete = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      router.delete(`/posts/${postId}`);
    }
  };

  const handleRestore = (postId: number) => {
    if (confirm("Are you sure you want to restore this post?")) {
      router.post(`/posts/${postId}/restore`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Post Management" />
      <div className="mt-8 mx-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Post Management</h1>
          <Link href="/posts/create">
            <Button>+ Add Post</Button>
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
              columns={getPostColumns({
                onStatusChange: handleStatusChange,
                onDelete: handleDelete,
                showActions: true,
                status: "published"
              })}
              data={posts.published}
              searchKey="title"
              placeholder="Search published posts..."
            />
          </TabsContent>

          <TabsContent value="draft">
            <DataTable
              columns={getPostColumns({
                onStatusChange: handleStatusChange,
                onDelete: handleDelete,
                showActions: true,
                status: "draft"
              })}
              data={posts.draft}
              searchKey="title"
              placeholder="Search draft posts..."
            />
          </TabsContent>

          <TabsContent value="trash">
            <DataTable
              columns={getPostColumns({
                onRestore: handleRestore,
                onDelete: handleDelete,
                showRestore: true,
                status: "trash"
              })}
              data={posts.trash}
              searchKey="title"
              placeholder="Search deleted posts..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PostsIndex;
