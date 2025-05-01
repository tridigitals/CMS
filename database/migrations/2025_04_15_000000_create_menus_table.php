<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
    Schema::create('menus', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('location')->unique();
        $table->string('description')->nullable();
        $table->timestamps();
    });

    Schema::create('menu_items', function (Blueprint $table) {
        $table->id();
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('url');
            $table->string('type');
            $table->string('icon')->nullable();
            $table->string('css_class')->nullable();
            $table->string('text_color')->nullable();
            $table->string('bg_color')->nullable();
            $table->boolean('highlight')->default(false);
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->string('target')->default('_self');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
    }
};