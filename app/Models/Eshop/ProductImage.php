<?php

namespace App\Models\Eshop;

use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'upload_file_id',
        'sort_order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function image()
    {
        return $this->belongsTo(UploadFile::class, 'upload_file_id');
    }
}
