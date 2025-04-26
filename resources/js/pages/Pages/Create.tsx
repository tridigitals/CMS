import React, { useState } from "react";
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
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';

interface Props extends PageProps {
    errors: Partial<{
        title: string;
        slug: string;
        content: string;
        meta_description: string;
        meta_keywords: string;
        featured_image: string;
    }>;
}

type PageForm = {
    title: string;
    slug: string;
    content: string;
    status: 'draft' | 'published';
    meta_description: string;
    meta_keywords: string;
    editor_type: 'classic' | 'pagebuilder';
    parent_id: number | null;
    order: number;
    featured_image: FeaturedImageValue;
    featured_image_id: number | null;
}

type FeaturedImageValue = { id: number; url: string } | File | null;

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pages", href: "/pages" },
    { title: "Add Page", href: "#" },
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

const PagesCreate: React.FC<Props> = ({ errors }) => {
    const { data, setData, post, processing } = useForm<PageForm>({
        title: '',
        slug: '',
        content: '',
        status: 'draft',
        meta_description: '',
        meta_keywords: '',
        editor_type: 'classic',
        parent_id: null,
        order: 0,
        featured_image: null as FeaturedImageValue,
        featured_image_id: null
    });
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
    const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);
    const [isSlugEdited, setIsSlugEdited] = useState(false);
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
        const value = slugify(e.target.value);
        setData("slug", value);
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

    const handleFeaturedImageChange = (media: { id?: number; url?: string } | File | null) => {
        if (media instanceof File) {
            setData('featured_image', media);
            setData('featured_image_id', null);
            setFeaturedImagePreview(URL.createObjectURL(media));
            setRemoveFeaturedImage(false);
        } else if (media && typeof media === 'object' && 'id' in media && 'url' in media) {
            setData('featured_image', { id: media.id ?? 0, url: media.url ?? "" });
            setData('featured_image_id', media.id ?? null);
            setFeaturedImagePreview(media.url ?? "");
            setRemoveFeaturedImage(false);
        } else {
            setData('featured_image', null);
            setData('featured_image_id', null);
            setFeaturedImagePreview("");
            setRemoveFeaturedImage(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pages', {
            onSuccess: () => {
                // Handle success
            },
        });
    };

    return (
        <AppLayout
            title="Create Page"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Create Page
                </h2>
            )}
            breadcrumbs={breadcrumbs}
        >
            <Head title="Create Page" />

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
                                        <div className="text-red-600 text-xs mt-1">{errors.title}</div>
                                    )}
                                </div>

                                {/* Slug */}
                                <div>
                                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Slug
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            id="slug"
                                            value={data.slug}
                                            onChange={handleSlugChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <button
                                            type="button"
                                            className="text-xs px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                            onClick={() => { setData('slug', slugify(data.title)); setIsSlugEdited(false); }}
                                            title="Reset slug sesuai judul"
                                        >
                                            Reset Slug
                                        </button>
                                    </div>
                                    {errors.slug && (
                                        <div className="text-red-600 text-xs mt-1">
                                            {Array.isArray(errors.slug) ? errors.slug[0] : errors.slug}
                                        </div>
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
                                        <div className="text-red-600 text-xs mt-1">{errors.content}</div>
                                    )}
                                </div>

                                {/* Meta Fields */}
                                <MetaFields
                                    title={data.title}
                                    metaDescription={data.meta_description}
                                    metaKeywords={data.meta_keywords}
                                    featuredImage={
                                        data.featured_image instanceof File
                                            ? (featuredImagePreview ? { id: 0, url: featuredImagePreview } : null)
                                            : data.featured_image
                                    }
                                    onMetaDescriptionChange={(value) => setData('meta_description', value)}
                                    onMetaKeywordsChange={(value) => setData('meta_keywords', value)}
                                    onFeaturedImageChange={handleFeaturedImageChange}
                                    featuredImagePreview={featuredImagePreview}
                                    errors={errors}
                                />

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
                                    {errors.status && (
                                        <div className="text-red-600 text-xs mt-1">{errors.status}</div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end mt-6">
                                    <Button
                                        type="submit"
                                        className="ml-3"
                                        disabled={processing}
                                    >
                                        {processing ? 'Saving...' : 'Create Page'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default PagesCreate;
