import React, { useState } from "react";
import Swal from "sweetalert2";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { getCommentColumns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Comment {
  id: number;
  content: string;
  user: User;
  post: {
    title: string;
  };
  status: string;
  created_at: string;
  parent_id: number | null;
  children: Comment[];
}

interface Props extends PageProps {
  comments: {
    approved: Comment[];
    pending: Comment[];
    spam: Comment[];
  };
  counts: {
    approved: number;
    pending: number;
    spam: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Comments", href: "/comments" },
];

const CommentsIndex: React.FC<Props> = ({
  comments,
  counts = { approved: 0, pending: 0, spam: 0 },
}) => {
  const [activeTab, setActiveTab] = useState("approved");

  const handleStatusChange = async (commentId: number, newStatus: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change the status of this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/comments/${commentId}/moderate`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          await Swal.fire("Success", "Comment status updated!", "success");
          window.location.reload();
        } else {
          await Swal.fire("Error", "Failed to update comment status.", "error");
        }
      } catch (error) {
        await Swal.fire("Error", "Failed to update comment status.", "error");
      }
    }
  };

  const handleDelete = async (commentId: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/comments/${commentId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
          },
        });

        if (response.ok) {
          await Swal.fire("Deleted!", "Comment has been deleted.", "success");
          window.location.reload();
        } else {
          await Swal.fire("Error", "Failed to delete comment.", "error");
        }
      } catch (error) {
        await Swal.fire("Error", "Failed to delete comment.", "error");
      }
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Comment Management" />
      <div className="mt-8 px-2 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h1 className="text-2xl font-bold">Comment Management</h1>
        </div>
        
        <Tabs defaultValue="approved" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              Approved
              <Badge variant="secondary">{counts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <Badge variant="outline">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="spam" className="flex items-center gap-2">
              Spam
              <Badge variant="destructive">{counts.spam}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved">
            {comments?.approved?.length > 0 ? (
              <div className="overflow-x-auto">
                <DataTable
                  columns={getCommentColumns({
                    onStatusChange: handleStatusChange,
                    onDelete: handleDelete,
                    showActions: true,
                    status: "approved"
                  })}
                  data={comments.approved}
                  searchKey="content"
                  placeholder="Search approved comments..."
                />
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No approved comments yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {comments?.pending?.length > 0 ? (
              <div className="overflow-x-auto">
                <DataTable
                  columns={getCommentColumns({
                    onStatusChange: handleStatusChange,
                    onDelete: handleDelete,
                    showActions: true,
                    status: "pending"
                  })}
                  data={comments.pending}
                  searchKey="content"
                  placeholder="Search pending comments..."
                />
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No pending comments yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="spam">
            {comments?.spam?.length > 0 ? (
              <div className="overflow-x-auto">
                <DataTable
                  columns={getCommentColumns({
                    onStatusChange: handleStatusChange,
                    onDelete: handleDelete,
                    showActions: true,
                    status: "spam"
                  })}
                  data={comments.spam}
                  searchKey="content"
                  placeholder="Search spam comments..."
                />
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Belum ada komentar spam
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommentsIndex;