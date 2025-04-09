<?php

namespace Modules\Blog\app\Filament\Resources\TagResource\Pages;

use Modules\Blog\app\Filament\Resources\TagResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTag extends CreateRecord
{
    protected static string $resource = TagResource::class;
}