<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->string('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            // Add featured_image_media_id to revisions
            $table->string('featured_image')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['draft', 'published', 'trash'])->default('draft');
            $table->softDeletes();
            $table->timestamps();
        });

        // Create post revisions table
        Schema::create('post_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->string('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->unsignedBigInteger('featured_image_media_id')->nullable();
            $table->json('changes')->nullable();
            $table->string('revision_type')->default('update'); // create, update
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
