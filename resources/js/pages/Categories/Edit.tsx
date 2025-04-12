import React, { useState } from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useForm, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

interface Props extends PageProps {
  category: Category;
}

const breadcrumbs = (catName: string): BreadcrumbItem[] => [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Categories", href: "/categories" },
  { title: `Edit: ${catName}`, href: "#" },
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

const CategoriesEdit: React.FC<Props> = ({ category }) => {
  const { data, setData, put, processing, errors } = useForm({
    name: category.name,
    slug: category.slug,
    description: category.description || "",
  });

  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setData("name", name);
    if (!isSlugEdited) {
      setData("slug", slugify(name));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData("slug", e.target.value);
    setIsSlugEdited(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/categories/${category.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs(category.name)}>
      <Head title={`Edit Category: ${category.name}`} />
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 rounded-full p-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#eab308" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"/></svg>
            </div>
            <h1 className="text-2xl font-bold">Edit Category</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Category Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={data.name}
                onChange={handleNameChange}
                required
              />
              {errors.name && (
                <div className="text-red-500 text-sm mt-1">{errors.name}</div>
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
                Slug otomatis dari nama, tapi bisa diubah manual.
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                rows={3}
              />
              {errors.description && (
                <div className="text-red-500 text-sm mt-1">{errors.description}</div>
              )}
            </div>
            <div className="flex justify-between items-center mt-8">
              <Link href="/categories">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing} className="px-8">
                Update
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CategoriesEdit;
