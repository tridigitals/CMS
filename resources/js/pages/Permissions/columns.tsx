import { Inertia } from "@inertiajs/inertia";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";

export type Permission = {
  id: number;
  name: string;
};

export function getPermissionColumns(): ColumnDef<Permission>[] {
  return [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">{row.index + 1}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Permission Name",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium w-full block">{row.original.name}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const permission = row.original;
        return (
          <div className="flex gap-1">
            <Link href={`/permissions/${permission.id}`}>
              <Button size="icon" variant="ghost" className="hover:bg-green-100" title="View">
                <Icon iconNode={Eye} className="w-4 h-4 text-green-600" />
              </Button>
            </Link>
            <Link href={`/permissions/${permission.id}/edit`}>
              <Button size="icon" variant="ghost" className="hover:bg-blue-100" title="Edit">
                <Icon iconNode={Edit} className="w-4 h-4 text-blue-600" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-red-100"
              title="Delete"
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete permission "${permission.name}"?`
                  )
                ) {
                  router.delete(`/permissions/${permission.id}`);
                }
              }}
            >
              <Icon iconNode={Trash2} className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
