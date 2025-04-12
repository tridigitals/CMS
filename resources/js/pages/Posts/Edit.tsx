import React, { useState } from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useForm, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PenSquare } from "lucide-react";

interface Props extends PageProps {
  post: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category_id: number;
    tags: number[];
  };
  categories: {
    id: number;
    name: string;
  }[];
  tagsList: {
    id: number;
    name: string;
  }[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Posts", href: "/posts" },
  { title: "Edit Post", href: "#" },
];

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const PostsEdit: React.FC<Props> = ({ post, categories, tagsList }) => {
  const { data, setData, put, processing, errors } = useForm<{
    title: string;
    slug: string;
    content: string;
    category_id: string;
    tags: number[];
  }>({
    title: post.title,
    slug: post.slug,
    content: post.content,
    category_id: String(post.category_id),
    tags: post.tags as number[],
  });

    const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: data.content,
    onUpdate: ({ editor }) => {
      setData('content', editor.getHTML())
    },
  })

  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setData("title", title);
    if (!isSlugEdited) {
      setData("slug", slugify(title));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData("slug", e.target.value);
    setIsSlugEdited(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setData("category_id", e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/posts/${post.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Post" />
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)] py-8">
        <Card className="w-full max-w-4xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 rounded-full p-3">
              <PenSquare className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold">Edit Post</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Post Title</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={data.title}
                onChange={handleTitleChange}
                required
              />
              {errors.title && (
                <div className="text-red-500 text-sm mt-1">{errors.title}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Slug</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={data.slug}
                onChange={handleSlugChange}
                required
              />
              {errors.slug && (
                <div className="text-red-500 text-sm mt-1">{errors.slug}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Slug otomatis dari judul, tapi bisa diubah manual.
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Content</label>
              <EditorContent 
                editor={editor} 
                className="min-h-[200px] w-full border rounded px-3 py-2 prose prose-sm max-w-none"
              />
              {errors.content && (
                <div className="text-red-500 text-sm mt-1">{errors.content}</div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={data.category_id}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <div className="text-red-500 text-sm mt-1">{errors.category_id}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tags</label>
                <select
                  multiple
                  className="w-full border rounded px-3 py-2 h-[120px]"
                  value={data.tags.map(String)}
                  onChange={(e) => setData("tags", Array.from(e.target.selectedOptions, option => Number(option.value)) as number[])}
                >
                  {tagsList.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                {errors.tags && (
                  <div className="text-red-500 text-sm mt-1">{errors.tags}</div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center pt-6 border-t mt-8">
              <Link href="/posts">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing} className="px-8">
                {processing ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PostsEdit;
