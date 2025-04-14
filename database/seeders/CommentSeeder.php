<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Comment;
use App\Models\User;
use App\Models\Post;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::pluck('id')->toArray();
        $posts = Post::pluck('id')->toArray();
        $statuses = [
            Comment::STATUS_APPROVED,
            Comment::STATUS_PENDING,
            Comment::STATUS_SPAM,
        ];

        if (empty($users) || empty($posts)) {
            $this->command->warn('No users or posts found. Please seed users and posts first.');
            return;
        }

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            for ($i = 0; $i < 50; $i++) {
                Comment::create([
                    'content' => fake()->sentence(12),
                    'user_id' => $users[array_rand($users)],
                    'post_id' => $posts[array_rand($posts)],
                    'parent_id' => null,
                    'status' => $statuses[array_rand($statuses)],
                ]);
            }
            \Illuminate\Support\Facades\DB::commit();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            $this->command->error('Failed to seed comments: ' . $e->getMessage());
        }
    }
}