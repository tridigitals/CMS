import React, { useState } from "react";
import { useForm, Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { type BreadcrumbItem } from "@/types";

type Role = {
  id: number;
  name: string;
};

type PageProps = {
  roles: Role[];
  errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Users", href: "/users" },
  { title: "Add User", href: "/users/create" },
];

export default function UsersCreate({ roles, errors = {} }: PageProps) {
  const { data, setData, post, processing } = useForm({
    name: "",
    email: "",
    password: "",
    roles: [] as string[],
  });

  const [showPassword, setShowPassword] = useState(false);

  const [rolesError, setRolesError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (data.roles.length === 0) {
      setRolesError("Please select at least one role.");
      return;
    }
    setRolesError(null);
    post(route("users.store"));
  }

  function handleRoleChange(roleName: string) {
    setData(
      "roles",
      data.roles.includes(roleName)
        ? data.roles.filter((r) => r !== roleName)
        : [...data.roles, roleName]
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add User" />
      <div className="flex justify-center items-center min-h-[70vh] py-16">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border w-full max-w-2xl p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-100 text-blue-700 rounded-full p-3">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold">Add New User</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block font-semibold mb-2 text-lg">Name</label>
              <Input
                type="text"
                value={data.name}
                onChange={e => setData("name", e.target.value)}
                placeholder="Full name"
                required
                className="h-12 text-lg"
              />
              {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-lg">Email</label>
              <Input
                type="email"
                value={data.email}
                onChange={e => setData("email", e.target.value)}
                placeholder="user@email.com"
                required
                className="h-12 text-lg"
              />
              {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-lg">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={e => setData("password", e.target.value)}
                  placeholder="Password"
                  required
                  className="pr-12 h-12 text-lg"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-lg">Roles</label>
              <div className="flex flex-wrap gap-3">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 cursor-pointer text-base">
                    <input
                      type="checkbox"
                      checked={data.roles.includes(role.name)}
                      onChange={() => handleRoleChange(role.name)}
                      className="accent-blue-600 w-5 h-5"
                    />
                    <Badge
                      className={`text-base px-3 py-1 ${
                        role.name === "admin"
                          ? "bg-blue-600 text-white"
                          : role.name === "editor"
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {role.name}
                    </Badge>
                  </label>
                ))}
              </div>
            {rolesError && <div className="text-red-600 text-sm mt-1">{rolesError}</div>}
            {errors.roles && <div className="text-red-600 text-sm mt-1">{errors.roles}</div>}
            </div>
            <div className="flex justify-between items-center pt-6 border-t mt-10">
              <Link
                href={route("users.index")}
                className="text-gray-600 hover:underline text-lg"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 text-lg h-12 px-8"
              >
                <UserPlus className="w-5 h-5" />
                {processing ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
