<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'birth_date',
        'gender',
        'national_id',
        'parent_name',
        'parent_phone',
        'alt_phone',
        'address',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function vaccinations(): HasMany
    {
        return $this->hasMany(Vaccination::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function getAgeInMonthsAttribute(): int
    {
        return (int) $this->birth_date->diffInMonths(now());
    }

    public function getAgeLabelAttribute(): string
    {
        $months = $this->age_in_months;
        $years = intdiv($months, 12);
        $remaining = $months % 12;

        if ($years === 0) {
            return "{$months} شهر";
        }

        if ($remaining === 0) {
            return $years === 1 ? 'سنة' : "{$years} سنوات";
        }

        return "{$years} سنة و{$remaining} شهر";
    }

    public function getGenderLabelAttribute(): string
    {
        return $this->gender === 'female' ? 'أنثى' : 'ذكر';
    }

    public function scopeSearch($query, ?string $term)
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('full_name', 'like', "%{$term}%")
                ->orWhere('parent_name', 'like', "%{$term}%")
                ->orWhere('parent_phone', 'like', "%{$term}%")
                ->orWhere('national_id', 'like', "%{$term}%")
                ->orWhereDate('birth_date', $term);
        });
    }
}
