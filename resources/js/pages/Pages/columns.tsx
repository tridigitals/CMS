import { router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowUpDown, Edit, Eye, Trash2, RotateCcw, MoreHorizontal, Pencil, CheckCircle, FileText } from "lucide-react";
import { Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  editor_type: string;
  author: {
    name: string;
  };
  created_at: string | null;
  updated_at: string | null;
  featured_image_url: string | null;
}

interface PageColumnsOptions {
  onStatusChange?: (pageId: number, status: string) => void;
  onDelete?: (pageId: number) => void;
  onRestore?: (pageId: number) => void;
  showActions?: boolean;
  showRestore?: boolean;
  status?: string;
}

export const getPageColumns = (options: PageColumnsOptions = {}): ColumnDef<Page>[] => {
  const columns: ColumnDef<Page>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/pages/${row.original.id}`}
            className="text-blue-600 hover:underline"
          >
            {row.getValue("title")}
          </Link>
          <span className="text-sm text-gray-500">
            By {row.original.author.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => <span>{row.original.author?.name}</span>,
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: "editor_type",
      header: "Editor",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("editor_type")}
        </Badge>
      ),
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.getValue("status") === "published"
              ? "bg-green-100 text-green-700"
              : row.getValue("status") === "draft"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => <span>{row.original.created_at}</span>,
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => <span>{row.original.updated_at}</span>,
      enableSorting: true,
      size: 120,
    },
  ];

  if (options.showActions || options.showRestore) {
    columns.push({
      id: "actions",
      cell: ({ row }) => {
        const page = row.original;

        // Handler for moving to trash
        const handleTrash = async () => {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: "This page will be moved to trash",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, move to trash",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
          });

          if (result.isConfirmed) {
            try {
              router.delete(`/pages/${page.id}`);
            } catch (error) {
              await Swal.fire("Error", "Failed to move page to trash.", "error");
            }
          }
        };

        // Handler for restore
        const handleRestore = async () => {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to restore this page?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, restore it!",
            cancelButtonText: "Cancel",
          });

          if (result.isConfirmed) {
            try {
              router.post(`/pages/${page.id}/restore`);
            } catch (error) {
              await Swal.fire("Error", "Failed to restore page.", "error");
            }
          }
        };

        // Handler for permanent delete
        const handleDelete = async () => {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: "This page will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
          });

          if (result.isConfirmed) {
            try {
              router.delete(`/pages/${page.id}/force-delete`);
            } catch (error) {
              await Swal.fire("Error", "Failed to delete page.", "error");
            }
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/pages/${page.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/pages/${page.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              {options.showActions && (
                <>
                  {page.status !== "published" && (
                    <DropdownMenuItem
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "Are you sure?",
                          text: "This page will be published.",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Yes, publish it!",
                          cancelButtonText: "Cancel",
                          confirmButtonColor: "#16a34a",
                        });
                        if (result.isConfirmed) {
                          if (options.onStatusChange) {
                            options.onStatusChange(page.id, "published");
                          } else {
                            router.patch(`/pages/${page.id}`, { status: "published" });
                          }
                        }
                      }}
                    >
                      <Icon iconNode={CheckCircle} className="mr-2 h-4 w-4" /> Publish
                    </DropdownMenuItem>
                  )}
                  {page.status === "published" && (
                    <DropdownMenuItem
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "Are you sure?",
                          text: "This page will be moved to draft.",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Yes, move to draft!",
                          cancelButtonText: "Cancel",
                          confirmButtonColor: "#fbbf24",
                        });
                        if (result.isConfirmed) {
                          if (options.onStatusChange) {
                            options.onStatusChange(page.id, "draft");
                          } else {
                            router.patch(`/pages/${page.id}`, { status: "draft" });
                          }
                        }
                      }}
                    >
                      <Icon iconNode={FileText} className="mr-2 h-4 w-4" /> Move to Draft
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleTrash} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                  </DropdownMenuItem>
                </>
              )}
              {options.showRestore && (
                <>
                  <DropdownMenuItem onClick={handleRestore}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Restore
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
};
