import React from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

interface Props extends PageProps {
  post: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    created_at: string;
    updated_at: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Posts", href: "/posts" },
  { title: "View Post", href: "#" },
];

const PostsShow: React.FC<Props> = ({ post }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={post.title} />
      <div className="mt-8 mx-6">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="mt-4">{post.content}</p>
      </div>
    </AppLayout>
  );
};

export default PostsShow;
