export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // Allow additional string properties
}

export interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    created_at: string;
    updated_at: string;
    meta_description: string;
    meta_keywords: string;
    featured_image_url?: string;
    status?: string;
}

export interface Comment {
    id: number;
    content: string;
    user: User;
    post?: {
        title: string;
    };
    status: string;
    created_at: string;
    updated_at?: string;
    parent_id: number | null;
    replies?: Comment[];
}