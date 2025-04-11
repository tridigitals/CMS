import { Inertia } from "@inertiajs/inertia";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Edit, Trash2, Eye } from "lucide-react";
import { Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";

export type Permission = {
  id: number;
  name: string;
};

export type Role = {
  id: number;
  name: string;
  permissions: Permission[];
};

export function getRoleColumns(): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 40,
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Role Name",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      enableSorting: false,
      cell: ({ row }) => {
        const perms = row.original.permissions;
        if (perms.length === 0) {
          return <span className="text-gray-400 text-xs">-</span>;
        }
        const maxShow = 3;
        const shown = perms.slice(0, maxShow);
        const more = perms.length - maxShow;
        return (
          <div>
            {shown.map((perm) => (
              <Badge key={perm.id} className="mr-1 text-xs bg-gray-200 text-gray-800">
                {perm.name}
              </Badge>
            ))}
            {more > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                and {more} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex gap-2">
            <Link href={`/roles/${role.id}`}>
              <Button size="icon" variant="ghost" className="hover:bg-green-100" title="View">
                <Icon iconNode={Eye} className="text-green-600" />
              </Button>
            </Link>
            <Link href={`/roles/${role.id}/edit`}>
              <Button size="icon" variant="ghost" className="hover:bg-blue-100" title="Edit">
                <Icon iconNode={Edit} className="text-blue-600" />
              </Button>
            </Link>
            {role.name !== "admin" && (
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-100"
                title="Delete"
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "This action cannot be undone.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "Cancel",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      router.delete(`/roles/${role.id}`, {
                        preserveScroll: true,
                      });
                    }
                  });
                }}
              >
                <Icon iconNode={Trash2} className="text-red-600" />
              </Button>
            )}
          </div>
        );
      },
      size: 120,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
