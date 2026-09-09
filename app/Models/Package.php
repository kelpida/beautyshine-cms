<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'path',
        'number',
        'subtitle',
        'description',
        'price',
        'purpose',
        'preparation',
        'tests',
        'faq',
        'main_image_id',
        'is_featured',
        'order_id',
        'package_category_id',
        'package_status_id',
        'package_gender_id',
        'package_age_id',
        'duration',
    ];

    protected $casts = [
        'preparation' => 'array',
        'tests' => 'array',
        'faq' => 'array',
    ];

    public function translates()
    {
        return $this->hasMany(PackageTranslate::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'package_attributes')->withPivot('value');
    }

    public function packageCapacities()
    {
        return $this->hasMany(StorePackageCapacity::class);
    }

    public function testCategories()
    {
        return $this->belongsToMany(AttributeCategory::class, 'package_attribute_categories');
    }

    public function packageCategory()
    {
        return $this->belongsTo(PackageCategory::class, 'package_category_id');
    }

    public function packageStatus()
    {
        return $this->belongsTo(PackageStatus::class, 'package_status_id');
    }

    public function packageGender()
    {
        return $this->belongsTo(PackageGender::class, 'package_gender_id');
    }

    public function packageAge()
    {
        return $this->belongsTo(PackageAge::class, 'package_age_id');
    }

    public function publicAttributes()
    {
        return $this->attributes()
            ->with([
                'attributeCategory.translates',
                'translates',
                'options.translates'
            ]);
    }

    public function gallery()
    {
        return $this->belongsToMany(UploadFile::class, 'package_galleries', 'package_id', 'image_id')->withPivot('order_id');
    }

    public function mainImage()
    {
        return $this->belongsTo(UploadFile::class, 'main_image_id');
    }

    public function auditLogs()
    {
        return $this->morphMany(
            AuditLog::class,
            'entity'
        )->latest('created_at');
    }

    /**
     * Get the route key for the model.
     * Use 'path' for public API routes, 'id' for admin routes
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        // Use ID for admin routes, path for public routes
        if (request()->is('api/*')) {
            return 'path';
        }
        return 'id';
    }

    public function categories()
    {
        return $this->belongsToMany(
            PackageCategory::class,
            'package_category_assignees',
            'package_id',
            'package_category_id'
        );
    }
}
