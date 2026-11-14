<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    public const TYPE_REMINDER = 'reminder';

    public const TYPE_MISSED = 'missed';

    public const TYPE_CUSTOM = 'custom';

    public const STATUS_PENDING = 'pending';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'child_id',
        'vaccination_id',
        'user_id',
        'parent_name',
        'parent_phone',
        'type',
        'body',
        'status',
        'provider',
        'error',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function vaccination(): BelongsTo
    {
        return $this->belongsTo(Vaccination::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_REMINDER => 'تذكير بموعد',
            self::TYPE_MISSED => 'تنبيه تأخر',
            default => 'رسالة مخصصة',
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_SENT => 'تم الإرسال',
            self::STATUS_FAILED => 'فشل الإرسال',
            default => 'في الانتظار',
        };
    }
}
