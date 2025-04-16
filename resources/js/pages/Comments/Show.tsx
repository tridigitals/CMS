import { Head } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import AppLayout from "@/layouts/app-layout";
import { Comment, User } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';

interface Props extends PageProps {
    comment: Comment;
    auth: {
        user: User;
    };
}

const breadcrumbs = (commentId: number): BreadcrumbItem[] => [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Comments", href: "/comments" },
    { title: `Comment #${commentId}`, href: "#" },
];

export default function Show({ auth, comment }: Props) {
    const moderateComment = async (status: string) => {
        try {
            const response = await fetch(`/comments/${comment.id}/moderate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                await Swal.fire({
                    title: 'Success!',
                    text: 'Comment status has been updated',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                window.location.reload();
            } else {
                throw new Error('Failed to update comment status');
            }
        } catch (error) {
            await Swal.fire({
                title: 'Failed!',
                text: 'An error occurred while updating the comment status',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'spam':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'pending':
                return 'Pending';
            case 'spam':
                return 'Spam';
            default:
                return status;
        }
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs(comment.id)}
        >
            <Head title="Comment Details" />

            <div className="py-12 animate-fadeIn">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
                        <CardHeader className="border-b bg-muted/20 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=random`} />
                                        <AvatarFallback>{comment.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-xl font-semibold">{comment.user?.name}</CardTitle>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>{format(new Date(comment.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={getStatusBadgeVariant(comment.status) as "destructive" | "secondary" | "default" | "outline"} className="text-sm">
                                    {getStatusLabel(comment.status)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {comment.status !== 'approved' && (
                                    <Button
                                        onClick={() => moderateComment('approved')}
                                        variant="default"
                                        size="sm"
                                        className="transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Approve
                                    </Button>
                                )}
                                {comment.status !== 'pending' && (
                                    <Button
                                        onClick={() => moderateComment('pending')}
                                        variant="outline"
                                        size="sm"
                                        className="transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        Pending
                                    </Button>
                                )}
                                {comment.status !== 'spam' && (
                                    <Button
                                        onClick={() => moderateComment('spam')}
                                        variant="destructive"
                                        size="sm"
                                        className="transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Spam
                                    </Button>
                                )}
                            </div>

                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-8 border-t pt-6">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold">Replies ({comment.replies.length})</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {comment.replies.map((reply: Comment) => (
                                            <Card key={reply.id} className="bg-muted/10">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.name || 'User')}&background=random`} />
                                                            <AvatarFallback>{reply.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{reply.user?.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(new Date(reply.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 mt-2">{reply.content}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}