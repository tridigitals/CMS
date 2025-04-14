<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'author_id',
        'title',
        'content',
        'meta_description',
        'meta_keywords',
        'changes',
        'revision_type'
    ];

    protected $casts = [
        'changes' => 'array'
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}