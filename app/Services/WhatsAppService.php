<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Normalize a phone number into international format (E.164-ish) for Egypt.
     */
    public function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone);

        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        if (str_starts_with($digits, '0')) {
            $digits = '20'.substr($digits, 1);
        }

        if (! str_starts_with($digits, '20') && strlen($digits) <= 10) {
            $digits = '20'.$digits;
        }

        return '+'.$digits;
    }

    /**
     * Build a wa.me deep link so staff can send the message manually.
     */
    public function link(string $phone, string $message): string
    {
        $number = ltrim($this->normalizePhone($phone), '+');

        return 'https://wa.me/'.$number.'?text='.rawurlencode($message);
    }

    /**
     * Send a WhatsApp message using the configured driver.
     *
     * @return array{ok: bool, provider: string, error: ?string}
     */
    public function send(string $phone, string $message): array
    {
        $driver = config('services.whatsapp.driver', 'log');

        return match ($driver) {
            'cloud' => $this->sendViaCloudApi($phone, $message),
            default => $this->sendViaLog($phone, $message),
        };
    }

    protected function sendViaLog(string $phone, string $message): array
    {
        Log::channel('single')->info('[WhatsApp] رسالة صادرة', [
            'to' => $this->normalizePhone($phone),
            'body' => $message,
        ]);

        return ['ok' => true, 'provider' => 'log', 'error' => null];
    }

    protected function sendViaCloudApi(string $phone, string $message): array
    {
        $phoneNumberId = config('services.whatsapp.phone_number_id');
        $token = config('services.whatsapp.access_token');
        $version = config('services.whatsapp.api_version', 'v21.0');

        if (blank($phoneNumberId) || blank($token)) {
            return [
                'ok' => false,
                'provider' => 'cloud',
                'error' => 'لم يتم ضبط بيانات واتساب (رقم الهاتف أو رمز الوصول).',
            ];
        }

        $url = "https://graph.facebook.com/{$version}/{$phoneNumberId}/messages";

        try {
            $response = Http::withToken($token)->post($url, [
                'messaging_product' => 'whatsapp',
                'to' => ltrim($this->normalizePhone($phone), '+'),
                'type' => 'text',
                'text' => ['preview_url' => false, 'body' => $message],
            ]);

            if ($response->failed()) {
                return [
                    'ok' => false,
                    'provider' => 'cloud',
                    'error' => $response->json('error.message') ?? 'فشل إرسال الرسالة عبر واتساب.',
                ];
            }

            return ['ok' => true, 'provider' => 'cloud', 'error' => null];
        } catch (\Throwable $e) {
            return ['ok' => false, 'provider' => 'cloud', 'error' => $e->getMessage()];
        }
    }
}
