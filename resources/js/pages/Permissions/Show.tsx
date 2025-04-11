import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageProps, BreadcrumbItem } from "@/types";

type Permission = {
  id: number;
  name: string;
};

interface Props extends PageProps {
  permission: Permission;
}

const breadcrumbs = (permName: string): BreadcrumbItem[] => [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Permissions", href: "/permissions" },
  { title: permName, href: "#" },
];

const PermissionShow: React.FC<Props> = ({ permission }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs(permission.name)}>
      <Head title={`Permission: ${permission.name}`} />
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-100 rounded-full p-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#eab308" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"/></svg>
            </div>
            <h1 className="text-2xl font-bold">Permission Detail</h1>
            <div className="flex gap-2 ml-auto">
              <Link href={`/permissions/${permission.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Link href="/permissions">
                <Button variant="outline">Back to List</Button>
              </Link>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Permission Name</label>
            <div className="text-lg font-semibold">{permission.name}</div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PermissionShow;
