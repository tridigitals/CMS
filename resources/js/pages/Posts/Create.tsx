import React, { useState, useEffect } from "react";
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
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#6366f1',
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f3f4f6' : 'transparent',
    color: state.isSelected ? 'white' : '#374151',
    '&:active': {
      backgroundColor: '#6366f1',
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#f3f4f6',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#374151',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    '&:hover': {
      backgroundColor: '#ef4444',
      color: 'white',
    },
  }),
};

interface Props extends PageProps {
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
}

type PostForm = {
  title: string;
  slug: string;
  content: string;
  category_ids: number[];
  tags: number[];
  meta_description: string;
  meta_keywords: string;
  featured_image: File | null;
}

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

const PostsCreate: React.FC<Props> = ({ categories: initialCategories, tags: initialTags }) => {
  const { data, setData, post, processing, errors } = useForm<PostForm>({
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
  const [tags, setTags] = useState<{ id: number; name: string }[]>(initialTags);
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");

  const [formErrors, setFormErrors] = useState<any>({});

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
    setFormErrors({}); // reset error sebelum submit
    router.post("/posts", formData, {
      forceFormData: true,
      onError: (errors) => {
        setFormErrors(errors);
      },
    });
  };

  const handleCreateTag = async (inputValue: string) => {
    try {
      const response = await fetch('/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({ name: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      const newTag = await response.json();
      // Update both the form data and the tags state
      setData('tags', [...data.tags, newTag.id]);
      const newTagOption = { id: newTag.id, name: newTag.name };
      setTags(prev => [...prev, newTagOption]);
      
      return newTagOption;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  };

  const handleCreateCategory = async (inputValue: string) => {
    try {
      const response = await fetch('/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({ name: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const newCategory = await response.json();
      setData('category_ids', [...data.category_ids, newCategory.id]);
      const newCategoryOption = { id: newCategory.id, name: newCategory.name };
      setCategories(prev => [...prev, newCategoryOption]);
      
      return newCategoryOption;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  };

  const categoryOptions = categories.map(category => ({ value: category.id, label: category.name }));
  const tagOptions = tags.map(tag => ({ value: tag.id, label: tag.name }));

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
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out hover:border-indigo-300 bg-white"
                  value={data.slug}
                  onChange={handleSlugChange}
                  placeholder="Auto-generated from title"
                  required
                />
                <button
                  type="button"
                  className="text-xs px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => { setData('slug', slugify(data.title)); setIsSlugEdited(false); }}
                  title="Reset slug sesuai judul"
                >
                  Reset Slug
                </button>
              </div>
              {(formErrors.slug || errors.slug) && (
                <div className="text-red-500 text-sm mt-1 animate-shake">
                  {formErrors.slug || errors.slug}
                </div>
              )}
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
            <CreatableSelect
              isMulti
              options={categoryOptions}
              value={categoryOptions.filter(option => data.category_ids.includes(option.value))}
              onChange={(selected) => setData('category_ids', selected ? selected.map(option => option.value) : [])}
              onCreateOption={handleCreateCategory}
              placeholder="Select or create categories..."
              className="basic-multi-select"
              classNamePrefix="select"
              styles={customStyles}
              formatCreateLabel={(inputValue: string) => `Create category "${inputValue}"`}
              noOptionsMessage={() => "Type to create a new category..."}
            />
            {errors.category_ids && <div className="text-red-500 text-sm mt-1 animate-shake">{errors.category_ids}</div>}
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
            <CreatableSelect
              isMulti
              options={tagOptions}
              value={tagOptions.filter(option => data.tags.includes(option.value))}
              onChange={(selected) => setData('tags', selected.map(option => option.value))}
              onCreateOption={handleCreateTag}
              placeholder="Select or create tags..."
              className="basic-multi-select"
              classNamePrefix="select"
              styles={customStyles}
              formatCreateLabel={(inputValue: string) => `Create tag "${inputValue}"`}
              noOptionsMessage={() => "Type to create a new tag..."}
            />
            {errors.tags && <div className="text-red-500 text-sm mt-1 animate-shake">{errors.tags}</div>}
          </div>
        </motion.div>
      </div>
      </motion.div>
    </AppLayout>
  );
};

export default PostsCreate;
