<?php

namespace App\Console\Commands;

use App\Models\Message;
use App\Models\Vaccination;
use App\Services\VaccinationService;
use Illuminate\Console\Command;

class SendVaccinationReminders extends Command
{
    protected $signature = 'vaccinations:remind
                            {--days= : عدد الأيام قبل الموعد لإرسال التذكير}
                            {--include-missed : إرسال تنبيهات للأطفال المتأخرين أيضاً}
                            {--dry-run : عرض الرسائل دون إرسالها}';

    protected $description = 'إرسال تذكيرات واتساب لأولياء الأمور بالتطعيمات المستحقة';

    public function handle(VaccinationService $service): int
    {
        $reminderDays = (int) ($this->option('days') ?? config('services.vaccination.reminder_days', 7));
        $includeMissed = (bool) $this->option('include-missed');
        $dryRun = (bool) $this->option('dry-run');

        $service->syncAll();

        $query = Vaccination::with(['child', 'vaccine'])
            ->whereNull('given_date')
            ->whereDate('due_date', '<=', now()->addDays($reminderDays)->toDateString());

        if (! $includeMissed) {
            $query->whereDate('due_date', '>=', now()->toDateString());
        }

        $vaccinations = $query->get();

        if ($vaccinations->isEmpty()) {
            $this->info('لا توجد تطعيمات مستحقة حالياً.');

            return self::SUCCESS;
        }

        $sent = 0;
        $failed = 0;

        foreach ($vaccinations as $vaccination) {
            $type = $vaccination->due_date->isPast() ? Message::TYPE_MISSED : Message::TYPE_REMINDER;
            $body = $service->buildMessage($vaccination->child, $vaccination, $type);

            if ($dryRun) {
                $this->line("→ {$vaccination->child->full_name} | {$vaccination->vaccine->name} | {$vaccination->due_date->toDateString()}");

                continue;
            }

            $message = $service->send($vaccination, $type);

            $message->status === Message::STATUS_SENT ? $sent++ : $failed++;
        }

        if ($dryRun) {
            $this->info("وضع المعاينة: {$vaccinations->count()} رسالة جاهزة للإرسال.");

            return self::SUCCESS;
        }

        $this->info("تم إرسال {$sent} رسالة، وفشل {$failed}.");

        return self::SUCCESS;
    }
}
