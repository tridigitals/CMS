import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, useForm, Head, router } from "@inertiajs/react";
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
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
}

type FormDataType = {
  title: string;
  slug: string;
  content: string;
  category_ids: number[];
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
  { title: "Add Post", href: "#" },
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

const PostsCreate: React.FC<Props> = ({ categories: initialCategories, tags }) => {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    title: "",
    slug: "",
    content: "",
    category_ids: [],
    tags: [],
    meta_description: "",
    meta_keywords: "",
    featured_image: null,
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");

  const handleEditorChange = (content: string) => {
    setData("content", content);
  };

  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setData("title", title);
    if (!isSlugEdited) setData("slug", slugify(title));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData("slug", e.target.value);
    setIsSlugEdited(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.value);
    if (e.target.checked) {
      setData("category_ids", [...data.category_ids, id]);
    } else {
      setData("category_ids", data.category_ids.filter((catId) => catId !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('content', data.content);
    data.category_ids.forEach(id => formData.append('category_ids[]', String(id)));
    data.tags.forEach(tag => formData.append('tags[]', String(tag)));
    formData.append('meta_description', data.meta_description);
    formData.append('meta_keywords', data.meta_keywords);
    if (data.featured_image) {
      formData.append('featured_image', data.featured_image);
    }
    // Use router.post for FormData, even for create
    router.post("/posts", formData, {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Post" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Add Post</h1>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out hover:border-indigo-300 bg-white"
                value={data.title}
                onChange={handleTitleChange}
                placeholder="Enter post title"
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
                placeholder="Auto-generated from title"
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
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                Save
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
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={category.id}
                    checked={data.category_ids.includes(category.id)}
                    onChange={handleCategoryChange}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
              {errors.category_ids && <div className="text-red-500 text-sm mt-1 animate-shake">{errors.category_ids}</div>}
            </div>
            <div className="mt-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newCategory.trim()) return;
                  setAddingCategory(true);
                  setAddCategoryError(null);
                  try {
                    const res = await fetch("/categories", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
                      },
                      body: JSON.stringify({ name: newCategory }),
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      setAddCategoryError(err?.errors?.name?.[0] || "Gagal menambah kategori");
                    } else {
                      const cat = await res.json();
                      setCategories((prev) => [...prev, cat]);
                      setData("category_ids", [...data.category_ids, cat.id]);
                      setNewCategory("");
                    }
                  } catch (err) {
                    setAddCategoryError("Gagal menambah kategori");
                  }
                  setAddingCategory(false);
                }}
                className="flex flex-col gap-2 mt-2"
              >
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Tambah kategori baru"
                  className="border border-gray-300 rounded-lg px-3 py-1 w-full"
                  disabled={addingCategory}
                />
                <Button type="submit" disabled={addingCategory || !newCategory.trim()} className="w-full">
                  {addingCategory ? "Menambah..." : "Tambah"}
                </Button>
              </form>
              {addCategoryError && <div className="text-red-500 text-sm mt-1">{addCategoryError}</div>}
            </div>
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
                setFeaturedImagePreview("");
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
              {tags.map((tag) => (
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

export default PostsCreate;
