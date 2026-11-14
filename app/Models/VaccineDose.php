<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaccineDose extends Model
{
    protected $fillable = [
        'vaccine_id',
        'dose_number',
        'age_in_months',
        'description',
    ];

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function getAgeLabelAttribute(): string
    {
        $months = $this->age_in_months;

        if ($months === 0) {
            return 'عند الولادة';
        }

        if ($months < 12) {
            return "{$months} شهر";
        }

        $years = intdiv($months, 12);
        $remaining = $months % 12;

        if ($remaining === 0) {
            return $years === 1 ? 'سنة' : "{$years} سنوات";
        }

        return "{$years} سنة و{$remaining} شهر";
    }
}
