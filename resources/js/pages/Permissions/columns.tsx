import { Inertia } from "@inertiajs/inertia";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import Swal, { SweetAlertResult } from 'sweetalert2';

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
                Swal.fire({
                  title: "Are you sure?",
                  text: "This action cannot be undone.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Yes, delete it!",
                  cancelButtonText: "Cancel",
                }).then((result: SweetAlertResult) => {
                  if (result.isConfirmed) {
                    router.delete(`/permissions/${permission.id}`, {
                      preserveScroll: true,
                      onSuccess: () => {
                        console.log("Permission deleted!");
                      },
                      onError: (errors) => {
                        console.error("Error deleting permission:", errors);
                        Swal.fire({
                          title: "Error",
                          text: "Failed to delete permission. Please try again.",
                          icon: "error",
                        });
                      },
                    });
                  }
                });
              }}
            >
              <Icon iconNode={Trash2} className="text-red-600" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
