import React, { useState } from "react";
import { useForm, router, Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, UserCog } from "lucide-react";
import { type BreadcrumbItem } from "@/types";

type Role = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  roles: Role[];
};

type PageProps = {
  user: User;
  roles: Role[];
  flash?: { success?: string; error?: string };
  errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Users", href: "/users" },
  { title: "Edit", href: "#" },
];

export default function EditUser() {
  const { props } = usePage<PageProps>();
  const { user, roles, flash, errors = {} } = props;

  const { data, setData, put, processing } = useForm({
    name: user.name,
    email: user.email,
    password: "",
    roles: user.roles.map((r) => r.name),
  });

  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    put(route("users.update", user.id));
  }

  function handleRoleChange(roleName: string) {
    setData(
      "roles",
      data.roles.includes(roleName)
        ? data.roles.filter((name: string) => name !== roleName)
        : [...data.roles, roleName]
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />
      <div className="flex justify-center items-center min-h-[70vh] py-16">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border w-full max-w-2xl p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-yellow-100 text-yellow-700 rounded-full p-3">
              <UserCog className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold">Edit User</h2>
          </div>
          {flash?.success && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
              {flash.success}
            </div>
          )}
          {flash?.error && (
            <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
              {flash.error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block font-semibold mb-2 text-lg">Name</label>
              <Input
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
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
                onChange={(e) => setData("email", e.target.value)}
                placeholder="user@email.com"
                required
                className="h-12 text-lg"
              />
              {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-lg">
                Password <span className="text-xs text-gray-400">(leave blank to keep current)</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={e => setData("password", e.target.value)}
                  placeholder="New password"
                  className="pr-12 h-12 text-lg"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-600"
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
                      className="accent-yellow-600 w-5 h-5"
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
              {errors.roles && <div className="text-red-600 text-sm mt-1">{errors.roles}</div>}
            </div>
            <div className="flex justify-between items-center pt-6 border-t mt-10">
              <Link href={route("users.index")} className="text-gray-600 hover:underline text-lg">
                Cancel
              </Link>
              <Button type="submit" disabled={processing} className="flex items-center gap-2 text-lg h-12 px-8">
                <UserCog className="w-5 h-5" />
                {processing ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
