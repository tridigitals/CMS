import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useForm, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

interface Props extends PageProps {}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Permissions", href: "/permissions" },
  { title: "Add Permission", href: "#" },
];

const PermissionsCreate: React.FC<Props> = () => {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/permissions");
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Permission" />
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 rounded-full p-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#eab308" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"/></svg>
            </div>
            <h1 className="text-2xl font-bold">Add Permission</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Permission Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
              />
              {errors.name && (
                <div className="text-red-500 text-sm mt-1">{errors.name}</div>
              )}
            </div>
            <div className="flex justify-between items-center mt-8">
              <Link href="/permissions">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing} className="px-8">
                Save
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PermissionsCreate;
