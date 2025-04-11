import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, UserCog } from "lucide-react";
import { type BreadcrumbItem } from "@/types";

type Role = {
  id: number;
  name: string;
};

type UserType = {
  id: number;
  name: string;
  email: string;
  roles: Role[];
};

type PageProps = {
  user: UserType;
  flash?: { success?: string; error?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Users", href: "/users" },
  { title: "Detail", href: "#" },
];

export default function ShowUser() {
  const { props } = usePage<PageProps>();
  const { user, flash } = props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="User Detail" />
      <div className="flex justify-center items-center min-h-[70vh] py-16">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border w-full max-w-2xl p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gray-100 text-gray-700 rounded-full p-3">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold">User Detail</h2>
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
          <div className="flex flex-col items-center gap-3 mb-10">
            <Avatar className="h-28 w-28 mb-2">
              <AvatarFallback className="text-3xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-2xl font-semibold flex items-center gap-2">
              <UserCog className="w-6 h-6 text-gray-400" />
              {user.name}
            </div>
            <div className="flex items-center gap-2 text-lg text-gray-500">
              <Mail className="w-5 h-5" />
              {user.email}
            </div>
            <div className="flex gap-3 mt-2">
              {user.roles.map((role) => (
                <Badge
                  key={role.id}
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
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-center pt-6 border-t mt-10">
            <Link href={route("users.edit", user.id)}>
              <Button variant="outline" className="text-lg h-12 px-8">Edit</Button>
            </Link>
            <Link href={route("users.index")}>
              <Button variant="secondary" className="text-lg h-12 px-8">Back to List</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
