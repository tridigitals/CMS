<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;
use App\Models\Category;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $categories = Category::all();
        
        $posts = [
            [
                'title' => 'Getting Started with Laravel',
                'content' => '<h2>Introduction to Laravel</h2><p>Laravel is a web application framework with expressive, elegant syntax. A web framework provides a structure and starting point for creating your application, allowing you to focus on creating something amazing while we sweat the details.</p>',
                'status' => 'published',
                'meta_description' => 'Comprehensive guide to getting started with Laravel framework',
                'meta_keywords' => 'laravel, php, web development, framework',
            ],
            [
                'title' => 'Understanding React Components',
                'content' => '<h2>What are React Components?</h2><p>Components are the building blocks of any React application. A component is a self-contained module that renders some output. Components can be nested within other components to allow complex applications to be built out of simple building blocks.</p>',
                'status' => 'published',
                'meta_description' => 'Learn about React components and their importance',
                'meta_keywords' => 'react, javascript, components, frontend',
            ],
            [
                'title' => 'TypeScript Best Practices',
                'content' => '<h2>Writing Better TypeScript Code</h2><p>TypeScript adds optional types to JavaScript that support tools for large-scale JavaScript applications. Understanding these best practices will help you write better, more maintainable code.</p>',
                'status' => 'draft',
                'meta_description' => 'Best practices for TypeScript development',
                'meta_keywords' => 'typescript, javascript, development, best practices',
            ],
            [
                'title' => 'Inertia.js and Laravel',
                'content' => '<h2>Building Modern Monoliths</h2><p>Inertia.js lets you quickly build modern single-page React, Vue and Svelte apps using classic server-side routing and controllers. Perfect for Laravel applications!</p>',
                'status' => 'published',
                'meta_description' => 'Guide to using Inertia.js with Laravel',
                'meta_keywords' => 'inertia.js, laravel, spa, react',
            ],
            [
                'title' => 'Database Design Patterns',
                'content' => '<h2>Common Database Patterns</h2><p>Understanding database design patterns is crucial for building scalable applications. This guide covers the most common patterns and their implementations.</p>',
                'status' => 'draft',
                'meta_description' => 'Learn about common database design patterns',
                'meta_keywords' => 'database, design patterns, sql, architecture',
            ],
            [
                'title' => 'Testing React Applications',
                'content' => '<h2>Modern Testing Practices</h2><p>Testing is an essential part of application development. Learn how to effectively test your React applications using Jest and React Testing Library.</p>',
                'status' => 'published',
                'meta_description' => 'Guide to testing React applications',
                'meta_keywords' => 'react, testing, jest, rtl',
            ],
            [
                'title' => 'API Security Best Practices',
                'content' => '<h2>Securing Your APIs</h2><p>Security is crucial for any API. This guide covers essential security practices including authentication, authorization, and data validation.</p>',
                'status' => 'draft',
                'meta_description' => 'Learn about API security best practices',
                'meta_keywords' => 'api, security, authentication, authorization',
            ],
            [
                'title' => 'CSS Architecture',
                'content' => '<h2>Building Scalable CSS</h2><p>A good CSS architecture is essential for maintaining large applications. Learn about BEM, SMACSS, and other methodologies for organizing your styles.</p>',
                'status' => 'published',
                'meta_description' => 'Guide to CSS architecture and organization',
                'meta_keywords' => 'css, architecture, bem, styling',
            ],
            [
                'title' => 'Performance Optimization',
                'content' => '<h2>Optimizing Web Applications</h2><p>Performance is a feature. Learn how to optimize your web applications for better user experience and search engine rankings.</p>',
                'status' => 'trash',
                'meta_description' => 'Tips for optimizing web application performance',
                'meta_keywords' => 'performance, optimization, web, speed',
            ],
            [
                'title' => 'DevOps Practices',
                'content' => '<h2>Modern DevOps Workflow</h2><p>Understanding DevOps practices is essential for modern development teams. Learn about CI/CD, automation, and deployment strategies.</p>',
                'status' => 'published',
                'meta_description' => 'Introduction to modern DevOps practices',
                'meta_keywords' => 'devops, ci/cd, automation, deployment',
            ],
        ];

        foreach ($posts as $postData) {
            $post = Post::create([
                'title' => $postData['title'],
                'slug' => \Str::slug($postData['title']),
                'content' => $postData['content'],
                'status' => $postData['status'],
                'meta_description' => $postData['meta_description'],
                'meta_keywords' => $postData['meta_keywords'],
                'author_id' => $users->random()->id,
                'category_id' => $categories->random()->id,
            ]);

            // Add some random tags
            $tags = ['backend', 'frontend', 'dev-ops', 'security', 'performance', 'design'];
            $randomTags = array_rand(array_flip($tags), rand(2, 4));
            $post->syncTags($randomTags);
        }
    }
}