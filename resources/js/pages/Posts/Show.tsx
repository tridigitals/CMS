import React from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import SocialShare from "@/components/posts/SocialShare";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface Props extends PageProps {
  post: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    created_at: string;
    updated_at: string;
    meta_description: string;
    meta_keywords: string;
    featured_image_url?: string;
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
      <Head title={post.title}>
        <meta name="description" content={post.meta_description} />
        <meta name="keywords" content={post.meta_keywords} />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description} />
        {post.featured_image_url && (
          <meta property="og:image" content={post.featured_image_url} />
        )}
        <meta property="og:type" content="article" />
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="overflow-hidden">
          {post.featured_image_url && (
            <div className="w-full h-[400px] relative">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div>
                Published: {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </div>
              <SocialShare
                url={window.location.href}
                title={post.title}
                description={post.meta_description}
              />
            </div>
            <div className="mt-8 prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PostsShow;
