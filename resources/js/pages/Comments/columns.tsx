import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: number;
  content: string;
  user: {
    name: string;
    email: string;
  };
  post: {
    title: string;
  };
  status: string;
  created_at: string;
  parent_id: number | null;
}

interface CommentColumnsProps {
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  showActions: boolean;
  status: string;
}

export const getCommentColumns = ({
  onStatusChange,
  onDelete,
  showActions,
  status,
}: CommentColumnsProps): ColumnDef<Comment>[] => [
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => {
      const comment = row.original;
      return (
        <div className="max-w-xl">
          <div className="font-medium">{comment.content}</div>
          <div className="text-sm text-muted-foreground">
            {comment.parent_id && "↳ "}
            On post: {comment.post.title}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "user",
    header: "Author",
    cell: ({ row }) => {
      const comment = row.original;
      return (
        <div>
          <div className="font-medium">{comment.user.name}</div>
          <div className="text-sm text-muted-foreground">{comment.user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Posted",
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.created_at), {
        addSuffix: true,
        locale: id,
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "approved"
              ? "success"
              : status === "pending"
              ? "warning"
              : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const comment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {status && status !== "approved" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(comment.id, "approved")}
              >
                Approve
              </DropdownMenuItem>
            )}
            {status && status !== "pending" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(comment.id, "pending")}
              >
                Mark as Pending
              </DropdownMenuItem>
            )}
            {status && status !== "spam" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(comment.id, "spam")}
              >
                Mark as Spam
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(comment.id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];