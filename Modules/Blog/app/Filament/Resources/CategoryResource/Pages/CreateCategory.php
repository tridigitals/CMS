<?php

namespace Modules\Blog\app\Filament\Resources\CategoryResource\Pages;

use Modules\Blog\app\Filament\Resources\CategoryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCategory extends CreateRecord
{
    protected static string $resource = CategoryResource::class;
}