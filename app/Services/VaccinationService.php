<?php

namespace App\Services;

use App\Models\Child;
use App\Models\Message;
use App\Models\User;
use App\Models\Vaccination;
use Illuminate\Support\Facades\DB;

class VaccinationService
{
    public function __construct(protected WhatsAppService $whatsapp) {}

    /**
     * Create the missing vaccination records for a child based on the schedule.
     */
    public function syncChild(Child $child): int
    {
        $created = 0;

        $doses = DB::table('vaccine_doses')
            ->join('vaccines', 'vaccines.id', '=', 'vaccine_doses.vaccine_id')
            ->where('vaccines.is_active', true)
            ->select('vaccine_doses.vaccine_id', 'vaccine_doses.dose_number', 'vaccine_doses.age_in_months')
            ->get();

        foreach ($doses as $dose) {
            $exists = Vaccination::where('child_id', $child->id)
                ->where('vaccine_id', $dose->vaccine_id)
                ->where('dose_number', $dose->dose_number)
                ->exists();

            if ($exists) {
                continue;
            }

            Vaccination::create([
                'child_id' => $child->id,
                'vaccine_id' => $dose->vaccine_id,
                'dose_number' => $dose->dose_number,
                'due_date' => $child->birth_date->copy()->addMonths((int) $dose->age_in_months),
                'status' => Vaccination::STATUS_PENDING,
            ]);

            $created++;
        }

        return $created;
    }

    /**
     * Sync records for every active child.
     *
     * @return array{children: int, records: int}
     */
    public function syncAll(): array
    {
        $children = 0;
        $records = 0;

        Child::where('is_active', true)->chunkById(100, function ($batch) use (&$children, &$records) {
            foreach ($batch as $child) {
                $records += $this->syncChild($child);
                $children++;
            }
        });

        return ['children' => $children, 'records' => $records];
    }

    public function buildMessage(Child $child, Vaccination $vaccination, string $type = Message::TYPE_REMINDER): string
    {
        $unit = config('services.vaccination.health_unit_name', 'الوحدة الصحية');
        $vaccine = $vaccination->vaccine->name;
        $dose = $vaccination->dose_number;
        $date = $vaccination->due_date->translatedFormat('j F Y');

        if ($type === Message::TYPE_MISSED) {
            return "السيد ولي الأمر / {$child->parent_name}\n\n"
                ."نود تذكيركم بأن الطفل / {$child->full_name} لم يحصل بعد على التطعيم المستحق.\n"
                ."التطعيم: {$vaccine} (الجرعة {$dose})\n"
                ."الموعد المقرر كان: {$date}\n\n"
                ."برجاء التوجه إلى {$unit} في أقرب وقت لاستكمال التطعيم.\n\n"
                ."مع تحيات {$unit}.";
        }

        return "السيد ولي الأمر / {$child->parent_name}\n\n"
            ."نحيطكم علماً بأن طفلكم / {$child->full_name} مستحق للحصول على التطعيم المقرر حسب جدول التطعيمات.\n"
            ."التطعيم: {$vaccine} (الجرعة {$dose})\n"
            ."موعد الحضور: {$date}\n\n"
            ."برجاء التوجه إلى {$unit} في الموعد المحدد للحصول على التطعيم.\n\n"
            ."مع تحيات {$unit}.";
    }

    /**
     * Create and send a WhatsApp message for a vaccination.
     */
    public function send(Vaccination $vaccination, string $type = Message::TYPE_REMINDER, ?User $user = null): Message
    {
        $child = $vaccination->child;

        $message = Message::create([
            'child_id' => $child->id,
            'vaccination_id' => $vaccination->id,
            'user_id' => $user?->id,
            'parent_name' => $child->parent_name,
            'parent_phone' => $child->parent_phone,
            'type' => $type,
            'body' => $this->buildMessage($child, $vaccination, $type),
            'status' => Message::STATUS_PENDING,
        ]);

        $result = $this->whatsapp->send($child->parent_phone, $message->body);

        $message->update([
            'status' => $result['ok'] ? Message::STATUS_SENT : Message::STATUS_FAILED,
            'provider' => $result['provider'],
            'error' => $result['error'],
            'sent_at' => $result['ok'] ? now() : null,
        ]);

        return $message;
    }
}
