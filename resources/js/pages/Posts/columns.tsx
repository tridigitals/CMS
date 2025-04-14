import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Trash2, RotateCcw, Eye, Pencil } from "lucide-react";
import { Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  status: string;
  author: {
    name: string;
  };
  created_at: string | null;
  updated_at: string | null;
  comments_count: number;
}

interface PostColumnsOptions {
  onStatusChange?: (postId: number, status: string) => void;
  onDelete?: (postId: number) => void;
  onRestore?: (postId: number) => void;
  showActions?: boolean;
  showRestore?: boolean;
  status?: string;
}

export const getPostColumns = (options: PostColumnsOptions = {}): ColumnDef<Post>[] => {
  const columns: ColumnDef<Post>[] = [
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
            href={`/posts/${row.original.id}`}
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        // row.original.category bisa string (lama) atau array (baru)
        let cats: string[] = [];
        if (Array.isArray(row.original.category)) {
          cats = row.original.category;
        } else if (typeof row.original.category === "string") {
          cats = row.original.category.split(",").map((c) => c.trim()).filter(Boolean);
        }
        const display = cats.slice(0, 3).join(", ");
        return (
          <span>
            {display}
            {cats.length > 3 && (
              <span className="text-gray-400 ml-1">+{cats.length - 3}</span>
            )}
          </span>
        );
      },
      enableSorting: true,
      size: 120,
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
      accessorKey: "comments_count",
      header: "Comments",
      cell: ({ row }) => (
        <span>{row.original.comments_count}</span>
      ),
      enableSorting: true,
      size: 60,
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
        const post = row.original;

        // Handler for status change (publish, unpublish, move to trash)
        const handleStatusChange = async (newStatus: string) => {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: `Do you want to change the status to ${newStatus}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, change it!",
            cancelButtonText: "Cancel",
          });

          if (result.isConfirmed) {
            try {
              const response = await fetch(`/posts/${post.id}/status`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
                },
                body: JSON.stringify({ status: newStatus }),
              });

              if (response.ok) {
                await Swal.fire("Success", "Post status updated!", "success");
                window.location.reload();
              } else {
                await Swal.fire("Error", "Failed to update post status.", "error");
              }
            } catch (error) {
              await Swal.fire("Error", "Failed to update post status.", "error");
            }
          }
        };

        // Handler for restore
        const handleRestore = async () => {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to restore this post?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, restore it!",
            cancelButtonText: "Cancel",
          });

          if (result.isConfirmed) {
            try {
              const response = await fetch(`/posts/${post.id}/restore`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
                },
              });

              if (response.ok) {
                await Swal.fire("Restored!", "Post has been restored.", "success");
                window.location.reload();
              } else {
                await Swal.fire("Error", "Failed to restore post.", "error");
              }
            } catch (error) {
              await Swal.fire("Error", "Failed to restore post.", "error");
            }
          }
        };

        // Handler for permanent delete
        const handleDelete = async () => {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the post.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
          });

          if (result.isConfirmed) {
            try {
              const response = await fetch(`/posts/${post.id}/force-delete`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
                },
              });

              if (response.ok) {
                await Swal.fire("Deleted!", "Post has been deleted.", "success");
                window.location.reload();
              } else {
                await Swal.fire("Error", "Failed to delete post.", "error");
              }
            } catch (error) {
              await Swal.fire("Error", "Failed to delete post.", "error");
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
              {/* View action */}
              <DropdownMenuItem asChild>
                <Link href={`/posts/${post.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" /> View
                </Link>
              </DropdownMenuItem>

              {/* Edit action (not for trash) */}
              {!options.showRestore && (
                <DropdownMenuItem asChild>
                  <Link href={`/posts/${post.id}/edit`} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
              )}

              {/* Status change actions (not for trash) */}
              {options.showActions && (
                <>
                  {options.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("published")}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" /> Publish
                    </DropdownMenuItem>
                  )}
                  {options.status === "published" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("draft")}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" /> Unpublish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("trash")}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                  </DropdownMenuItem>
                </>
              )}

              {/* Restore action (only for trash) */}
              {options.showRestore && (
                <DropdownMenuItem onClick={handleRestore}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Restore
                </DropdownMenuItem>
              )}

              {/* Delete action (only for trash) */}
              {options.showRestore && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
};
