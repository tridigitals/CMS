<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Tags\HasTags;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Tags\Tag;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Post extends Model implements HasMedia
{
    use HasFactory, HasTags, InteractsWithMedia, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'meta_description',
        'meta_keywords',
        'featured_image',
        'author_id',
        'status'
    ];

    protected $appends = ['featured_image_url'];

    // Possible post statuses
    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_TRASH = 'trash';

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($post) {
            $post->slug = Str::slug($post->title);
            $post->author_id = $post->author_id ?? auth()->id();
        });

        static::updating(function ($post) {
            if ($post->isDirty('title')) {
                $post->slug = Str::slug($post->title);
            }

            $post->createRevision();
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('featured_image')
            ->singleFile()
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(400)
                    ->height(300);
                $this->addMediaConversion('social')
                    ->width(1200)
                    ->height(630);
            });
    }

    public function getFeaturedImageUrlAttribute()
    {
        return $this->getFirstMediaUrl('featured_image');
    }

    public function getStructuredData(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $this->title,
            'description' => $this->meta_description,
            'image' => $this->featured_image_url,
            'datePublished' => $this->created_at->toIso8601String(),
            'dateModified' => $this->updated_at->toIso8601String(),
            'author' => [
                '@type' => 'Person',
                'name' => $this->author->name
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name'),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('logo.svg')
                ]
            ]
        ];
    }

    public function getOpenGraphData(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->meta_description,
            'image' => $this->getFirstMediaUrl('featured_image', 'social'),
            'type' => 'article',
            'published_time' => $this->created_at->toIso8601String(),
            'modified_time' => $this->updated_at->toIso8601String(),
            'author' => $this->author->name
        ];
    }

    public function createRevision()
    {
        $changes = [];
        foreach (['title', 'content', 'meta_description', 'meta_keywords'] as $field) {
            if ($this->isDirty($field)) {
                $changes[$field] = [
                    'old' => $this->getOriginal($field),
                    'new' => $this->getAttribute($field)
                ];
            }
        }

        $this->revisions()->create([
            'author_id' => auth()->id(),
            'title' => $this->title,
            'content' => $this->content,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
            'changes' => $changes,
            'revision_type' => $this->wasRecentlyCreated ? 'create' : 'update'
        ]);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_post');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(PostRevision::class)->orderBy('created_at', 'desc');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeTrash($query)
    {
        return $query->where('status', self::STATUS_TRASH);
    }

    public function toggleStatus(string $status)
    {
        if (in_array($status, [self::STATUS_DRAFT, self::STATUS_PUBLISHED, self::STATUS_TRASH])) {
            $this->update(['status' => $status]);
        }
    }

    public function restore()
    {
        $this->status = self::STATUS_DRAFT;
        $this->save();
        parent::restore();
    }
}
