import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Pagination } from "@/components/ui/pagination";

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
  created_at: string;
  post: {
    id: number;
    title: string;
  };
}

interface Props {
  comments: {
    data: Comment[];
    current_page: number;
    last_page: number;
  };
}

export default function Moderation({ comments }: Props) {
  const { post: submitModeration, processing } = useForm();

  const handleModeration = (commentId: number, status: string) => {
    submitModeration(route("comments.moderate", commentId), {
      data: { status },
      method: "patch",
    });
  };

  return (
    <>
      <Head title="Moderasi Komentar" />

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Moderasi Komentar</h2>
        </CardHeader>
        <CardContent>
          {comments.data.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Tidak ada komentar yang perlu dimoderasi
            </p>
          ) : (
            <div className="space-y-6">
              {comments.data.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{comment.user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Pada postingan: {comment.post.title}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModeration(comment.id, "approved")}
                          disabled={processing}
                          variant="default"
                        >
                          Setujui
                        </Button>
                        <Button
                          onClick={() => handleModeration(comment.id, "spam")}
                          disabled={processing}
                          variant="destructive"
                        >
                          Tandai sebagai Spam
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {comments.last_page > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={comments.current_page}
                lastPage={comments.last_page}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}