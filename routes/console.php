<?php

use App\Console\Commands\SendVaccinationReminders;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(SendVaccinationReminders::class)
    ->dailyAt('09:00')
    ->description('إرسال تذكيرات التطعيمات اليومية عبر واتساب');
