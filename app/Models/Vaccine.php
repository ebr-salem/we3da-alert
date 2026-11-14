<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vaccine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function doses(): HasMany
    {
        return $this->hasMany(VaccineDose::class)->orderBy('dose_number');
    }

    public function vaccinations(): HasMany
    {
        return $this->hasMany(Vaccination::class);
    }
}
