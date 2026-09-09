<?php

namespace App\Models;

use App\Enum\DayOfWeek;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreHour extends Model
{
    protected $fillable = [
        'store_id',
        'day_of_week',
        'is_closed',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'day_of_week' => DayOfWeek::class,
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
