import React from "react";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useForm, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

type Permission = {
  id: number;
  name: string;
};

interface Props extends PageProps {
  permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Roles", href: "/roles" },
  { title: "Add Role", href: "#" },
];

const RolesCreate: React.FC<Props> = ({ permissions }) => {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    permissions: [] as number[],
  });

  const handlePermissionChange = (id: number) => {
    setData(
      "permissions",
      data.permissions.includes(id)
        ? data.permissions.filter((pid) => pid !== id)
        : [...data.permissions, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/roles");
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Role" />
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 rounded-full p-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#eab308" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"/></svg>
            </div>
            <h1 className="text-2xl font-bold">Add Role</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Role Name</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer
                      ${data.permissions.includes(permission.id)
                        ? "bg-blue-50 border-blue-500"
                        : "bg-gray-50 border-gray-200"}
                    `}
                  >
                    <Checkbox
                      checked={data.permissions.includes(permission.id)}
                      onCheckedChange={() =>
                        handlePermissionChange(permission.id)
                      }
                    />
                    <span
                      className={`text-xs font-semibold
                        ${data.permissions.includes(permission.id)
                          ? "text-blue-700"
                          : "text-gray-600"}
                      `}
                    >
                      {permission.name}
                    </span>
                  </label>
                ))}
              </div>
              {errors.permissions && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.permissions}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-8">
              <Link href="/roles">
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

export default RolesCreate;
