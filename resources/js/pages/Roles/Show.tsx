import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type BreadcrumbItem, PageProps as BasePageProps } from "@/types";
import { Card } from "@/components/ui/card";

type Permission = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
};

interface Props extends BasePageProps {
  role: Role;
  permissions: Permission[];
}

const breadcrumbs = (roleName: string): BreadcrumbItem[] => [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Roles", href: "/roles" },
  { title: roleName, href: "#" },
];

const RoleShow: React.FC<Props> = ({ role, permissions }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs(role.name)}>
      <Head title={`Role: ${role.name}`} />
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 rounded-full p-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#eab308" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"/></svg>
            </div>
            <h1 className="text-2xl font-bold">Role Detail</h1>
            <div className="flex gap-2 ml-auto">
              <Link href={`/roles/${role.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Link href="/roles">
                <Button variant="outline">Back to List</Button>
              </Link>
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-500 mb-1">Role Name</label>
            <div className="text-lg font-semibold">{role.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {permissions.length === 0 ? (
                <span className="text-gray-400 text-xs">No permissions assigned.</span>
              ) : (
                permissions.map((perm) => (
                  <Badge key={perm.id} className="bg-gray-200 text-gray-800 text-xs">
                    {perm.name}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RoleShow;
