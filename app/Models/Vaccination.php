<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vaccination extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_GIVEN = 'given';

    public const STATUS_MISSED = 'missed';

    protected $fillable = [
        'child_id',
        'vaccine_id',
        'dose_number',
        'due_date',
        'given_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'given_date' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Vaccination $vaccination) {
            $vaccination->status = $vaccination->resolveStatus();
        });
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function resolveStatus(): string
    {
        if ($this->given_date) {
            return self::STATUS_GIVEN;
        }

        if ($this->due_date && $this->due_date->isPast()) {
            return self::STATUS_MISSED;
        }

        return self::STATUS_PENDING;
    }

    public function getDaysUntilDueAttribute(): int
    {
        return (int) now()->startOfDay()->diffInDays($this->due_date->copy()->startOfDay(), false);
    }

    public function getStateAttribute(): string
    {
        if ($this->given_date) {
            return 'given';
        }

        if ($this->days_until_due < 0) {
            return 'missed';
        }

        if ($this->days_until_due <= (int) config('services.vaccination.reminder_days', 7)) {
            return 'due';
        }

        return 'upcoming';
    }

    public function getStateLabelAttribute(): string
    {
        return match ($this->state) {
            'given' => 'تم التطعيم',
            'missed' => 'متأخر',
            'due' => 'مستحق الآن',
            default => 'قادم',
        };
    }

    public function scopeDue($query)
    {
        return $query->whereNull('given_date')
            ->whereDate('due_date', '<=', now()->addDays((int) config('services.vaccination.reminder_days', 7)));
    }

    public function scopeMissed($query)
    {
        return $query->whereNull('given_date')->whereDate('due_date', '<', now());
    }
}
