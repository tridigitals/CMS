import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Trash2, RotateCcw, Eye, Pencil } from "lucide-react";
import { Link } from "@inertiajs/react";
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
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (options.showActions || options.showRestore) {
    columns.push({
      id: "actions",
      cell: ({ row }) => {
        const post = row.original;

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
              {options.showActions && options.onStatusChange && (
                <>
                  {options.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => options.onStatusChange?.(post.id, "published")}
                    >
                      Publish
                    </DropdownMenuItem>
                  )}
                  {options.status === "published" && (
                    <DropdownMenuItem
                      onClick={() => options.onStatusChange?.(post.id, "draft")}
                    >
                      Unpublish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => options.onStatusChange?.(post.id, "trash")}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                  </DropdownMenuItem>
                </>
              )}

              {/* Restore action (only for trash) */}
              {options.showRestore && options.onRestore && (
                <DropdownMenuItem onClick={() => options.onRestore?.(post.id)}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Restore
                </DropdownMenuItem>
              )}

              {/* Delete action (only for trash) */}
              {options.showRestore && options.onDelete && (
                <DropdownMenuItem
                  onClick={() => options.onDelete?.(post.id)}
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
