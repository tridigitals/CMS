import React, { useState, useEffect } from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, useForm, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetaFields from "@/components/Posts/MetaFields";

interface Props extends PageProps {
  post: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category_id: number;
    tags: number[];
    meta_description: string;
    meta_keywords: string;
    featured_image_url?: string;
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

type FormDataType = {
  title: string;
  slug: string;
  content: string;
  category_id: string;
  tags: number[];
  meta_description: string;
  meta_keywords: string;
  featured_image: File | null;
  [key: string]: any;  // Index signature for string keys
}

interface FormData extends FormDataType {}

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
  const { data, setData, put, processing, errors } = useForm<FormData>({
    title: post.title,
    slug: post.slug,
    content: post.content,
    category_id: String(post.category_id),
    tags: post.tags as number[],
    meta_description: post.meta_description || "",
    meta_keywords: post.meta_keywords || "",
    featured_image: null,
  });

  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>(post.featured_image_url || "");

    const handleEditorChange = (content: string) => {
    setData("content", content);
  };

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
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('content', data.content);
    formData.append('category_id', data.category_id);
    data.tags.forEach(tag => formData.append('tags[]', String(tag)));
    formData.append('meta_description', data.meta_description);
    formData.append('meta_keywords', data.meta_keywords);
    if (data.featured_image) {
      formData.append('featured_image', data.featured_image);
    }
    put(`/posts/${post.id}`, formData as any);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Post" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Post</h1>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out hover:border-indigo-300 bg-white"
                value={data.title}
                onChange={handleTitleChange}
                required
              />
              {errors.title && <div className="text-red-500 text-sm mt-1 animate-shake">{errors.title}</div>}
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out hover:border-indigo-300 bg-white"
                value={data.slug}
                onChange={handleSlugChange}
                required
              />
              {errors.slug && <div className="text-red-500 text-sm mt-1 animate-shake">{errors.slug}</div>}
              <div className="text-xs text-gray-400 mt-1 transition-opacity duration-200 hover:text-gray-600">
                Slug otomatis dari judul, tapi bisa diubah manual.
              </div>
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Content</label>
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="mb-2">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <div className="border border-gray-300 rounded-lg bg-gray-50 p-4 min-h-[300px] transition-all duration-200 ease-in-out hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500">
                    <Editor
                      value={data.content}
                      licenseKey="gpl"
                      onEditorChange={handleEditorChange}
                      init={{
                        height: 400,
                        menubar: true,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                        branding: false,
                        promotion: false,
                        skin: "oxide",
                        skin_url: "/tinymce/skins/ui/oxide",
                        content_css: "/tinymce/skins/content/default/content.min.css",
                        icons: "default",
                        icons_url: "/tinymce/icons/default/icons.min.js",
                        base_url: '/tinymce'
                      }}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border border-gray-300 rounded-lg bg-white p-6 min-h-[300px] prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: data.content || '<p class="text-gray-400">No content yet...</p>' }} />
                  </div>
                </TabsContent>
              </Tabs>
              {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/posts">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={processing}
                className="bg-indigo-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-indigo-500 transition"
              >
                {processing ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </div>
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Category</h2>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out hover:border-indigo-300 bg-white"
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
            {errors.category_id && <div className="text-red-500 text-sm mt-1 animate-shake">{errors.category_id}</div>}
          </div>
          <MetaFields
            title={data.title}
            metaDescription={data.meta_description}
            metaKeywords={data.meta_keywords}
            featuredImage={data.featured_image}
            onMetaDescriptionChange={(value) => setData('meta_description', value)}
            onMetaKeywordsChange={(value) => setData('meta_keywords', value)}
            onFeaturedImageChange={(file) => {
              setData('featured_image', file);
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setFeaturedImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              } else {
                setFeaturedImagePreview(post.featured_image_url || "");
              }
            }}
            featuredImagePreview={featuredImagePreview}
            errors={errors}
          />
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Tags</h2>
            <select
              multiple
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out hover:border-indigo-300 bg-white min-h-[120px]"
              value={data.tags.map(String)}
              onChange={(e) =>
                setData(
                  "tags",
                  Array.from(e.target.selectedOptions, (option) => Number(option.value)) as number[]
                )
              }
            >
              {tagsList.map((tag) => (
                <option key={tag.id} value={tag.id} className="p-1 hover:bg-indigo-50">
                  {tag.name}
                </option>
              ))}
            </select>
            {errors.tags && <div className="text-red-500 text-sm mt-1 animate-shake">{errors.tags}</div>}
          </div>
        </motion.div>
      </div>
      </motion.div>
    </AppLayout>
  );
};

export default PostsEdit;
