import { router } from "@inertiajs/react";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "@inertiajs/react";

export type User = {
  id: number;
  name: string;
  email: string;
  roles: { id: number; name: string }[];
};

export function getUserColumns(authUserId: number): ColumnDef<User>[] {
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
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      accessorKey: "roles",
      header: "Roles",
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          {row.original.roles.map((role) => (
            <Badge
              key={role.id}
              className={`mr-1 text-xs ${
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
      ),
    },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <Link href={route("users.show", user.id)}>
            <Button size="icon" variant="ghost" className="hover:bg-green-100" title="View">
              <Icon iconNode={Eye} className="text-green-600" />
            </Button>
          </Link>
          <Link href={route("users.edit", user.id)}>
            <Button size="icon" variant="ghost" className="hover:bg-blue-100" title="Edit">
              <Icon iconNode={Edit} className="text-blue-600" />
            </Button>
          </Link>
          {user.id !== authUserId && (
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
                    router.delete(route("users.destroy", user.id), {
                      preserveScroll: true,
                      onSuccess: () => {
                        console.log("User deleted!");
                      },
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
