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
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';

interface Props extends PageProps {
    page: {
        id: number;
        title: string;
        slug: string;
        content: string;
        meta_description: string;
        meta_keywords: string;
        status: 'draft' | 'published';
        editor_type: 'classic' | 'pagebuilder';
        parent_id: number | null;
        order: number;
        featured_image_url: string | null;
        author: {
            name: string;
        };
    };
}

type PageForm = {
    title: string;
    slug: string;
    content: string;
    meta_description: string;
    meta_keywords: string;
    status: 'draft' | 'published';
    editor_type: 'classic' | 'pagebuilder';
    parent_id: number | null;
    order: number;
    featured_image: File | null;
    _method: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pages", href: "/pages" },
    { title: "Edit Page", href: "#" },
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

const PagesEdit: React.FC<Props> = ({ page }) => {
    const { data, setData, post, processing, errors } = useForm<PageForm>({
        title: page.title,
        slug: page.slug,
        content: page.content,
        meta_description: page.meta_description,
        meta_keywords: page.meta_keywords,
        status: page.status,
        editor_type: page.editor_type,
        parent_id: page.parent_id,
        order: page.order,
        featured_image: null,
        _method: 'PUT',
    });

    const [featuredImagePreview, setFeaturedImagePreview] = useState<string>(page.featured_image_url || "");
    const [isSlugEdited, setIsSlugEdited] = useState(true);
    const [editor, setEditor] = useState<any>(null);

    const handleEditorChange = (content: string) => {
        setData("content", content);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setData("title", title);
        if (!isSlugEdited) setData("slug", slugify(title));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData("slug", e.target.value);
        setIsSlugEdited(true);
    };

    const initGrapesJS = (container: string) => {
        if (editor) {
            editor.destroy();
        }

        const newEditor = grapesjs.init({
            container: container,
            plugins: [gjsPresetWebpage, gjsBlocksBasic],
            pluginsOpts: {
                gjsPresetWebpage: {},
                gjsBlocksBasic: {},
            },
            storageManager: false,
            panels: { defaults: [] },
        });

        setEditor(newEditor);
        
        // Load the content
        newEditor.setComponents(page.content);
        
        newEditor.on('change:changesCount', () => {
            setData('content', newEditor.getHtml() + '<style>' + newEditor.getCss() + '</style>');
        });
    };

    const handleEditorTypeChange = (type: 'classic' | 'pagebuilder') => {
        setData('editor_type', type);
        if (type === 'pagebuilder') {
            setTimeout(() => {
                initGrapesJS('#gjs');
            }, 100);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key as keyof PageForm] !== null) {
                if (key === 'featured_image' && data.featured_image) {
                    formData.append(key, data.featured_image);
                } else {
                    formData.append(key, String(data[key as keyof PageForm]));
                }
            }
        });

        router.post(`/pages/${page.id}`, formData, {
            forceFormData: true,
        });
    };

    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setData("featured_image", e.target.files[0]);
            setFeaturedImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    useEffect(() => {
        if (data.editor_type === 'pagebuilder') {
            initGrapesJS('#gjs');
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Page" />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-8 max-w-7xl"
            >
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg p-6">
                                <div className="grid gap-6">
                                    {/* Title */}
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={data.title}
                                            onChange={handleTitleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Slug
                                        </label>
                                        <input
                                            type="text"
                                            id="slug"
                                            value={data.slug}
                                            onChange={handleSlugChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        {errors.slug && (
                                            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                                        )}
                                    </div>

                                    {/* Editor Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Editor Type
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value="classic"
                                                    checked={data.editor_type === 'classic'}
                                                    onChange={() => handleEditorTypeChange('classic')}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">Classic Editor</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value="pagebuilder"
                                                    checked={data.editor_type === 'pagebuilder'}
                                                    onChange={() => handleEditorTypeChange('pagebuilder')}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">Page Builder</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Content Editor */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Content
                                        </label>
                                        {data.editor_type === 'classic' ? (
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
                                        ) : (
                                            <div id="gjs" style={{ height: '700px', border: '2px solid #ccc' }}></div>
                                        )}
                                        {errors.content && (
                                            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                        )}
                                    </div>

                                    {/* Meta Fields */}
                                    <MetaFields
                                        metaDescription={data.meta_description || ''}
                                        metaKeywords={data.meta_keywords || ''}
                                        title={data.title || ''}
                                        featuredImage={null}
                                        onMetaDescriptionChange={(value) => setData('meta_description', value)}
                                        onMetaKeywordsChange={(value) => setData('meta_keywords', value)}
                                        onFeaturedImageChange={(file) => {
                                            if (file instanceof File) {
                                                setData('featured_image', file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFeaturedImagePreview(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            } else {
                                                setData('featured_image', null);
                                                setFeaturedImagePreview('');
                                            }
                                        }}
                                        featuredImagePreview={featuredImagePreview}
                                        errors={errors}
                                    />

                                    {/* Featured Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Featured Image
                                        </label>
                                        <input
                                            type="file"
                                            onChange={handleFeaturedImageChange}
                                            accept="image/*"
                                            className="mt-1 block w-full"
                                        />
                                        {featuredImagePreview && (
                                            <img
                                                src={featuredImagePreview}
                                                alt="Preview"
                                                className="mt-2 h-32 w-auto object-cover"
                                            />
                                        )}
                                        {errors.featured_image && (
                                            <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end mt-6">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="ml-3"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </AppLayout>
    );
};

export default PagesEdit;
