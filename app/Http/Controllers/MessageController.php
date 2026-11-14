<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Vaccination;
use App\Services\VaccinationService;
use App\Services\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function __construct(
        protected VaccinationService $vaccinations,
        protected WhatsAppService $whatsapp,
    ) {}

    public function index(Request $request): Response
    {
        $reminderDays = (int) config('services.vaccination.reminder_days', 7);
        $type = $request->string('type')->toString() ?: 'all';

        $query = Vaccination::query()
            ->with(['child:id,full_name,parent_name,parent_phone', 'vaccine:id,name'])
            ->whereNull('given_date')
            ->whereDate('due_date', '<=', now()->addDays($reminderDays)->toDateString());

        if ($type === 'missed') {
            $query->whereDate('due_date', '<', now()->toDateString());
        } elseif ($type === 'due') {
            $query->whereDate('due_date', '>=', now()->toDateString());
        }

        $reminders = $query->orderBy('due_date')
            ->get()
            ->map(function (Vaccination $v) {
                $messageType = $v->due_date->isPast() ? Message::TYPE_MISSED : Message::TYPE_REMINDER;
                $body = $this->vaccinations->buildMessage($v->child, $v, $messageType);

                return [
                    'id' => $v->id,
                    'child_id' => $v->child_id,
                    'child_name' => $v->child->full_name,
                    'parent_name' => $v->child->parent_name,
                    'parent_phone' => $v->child->parent_phone,
                    'vaccine_name' => $v->vaccine->name,
                    'dose_number' => $v->dose_number,
                    'due_date' => $v->due_date->toDateString(),
                    'state' => $v->state,
                    'state_label' => $v->state_label,
                    'days_until_due' => $v->days_until_due,
                    'type' => $messageType,
                    'body' => $body,
                    'wa_link' => $this->whatsapp->link($v->child->parent_phone, $body),
                    'last_sent_at' => Message::where('vaccination_id', $v->id)
                        ->where('status', Message::STATUS_SENT)
                        ->latest('sent_at')
                        ->value('sent_at'),
                ];
            });

        $stats = [
            'total' => $reminders->count(),
            'missed' => $reminders->where('type', Message::TYPE_MISSED)->count(),
            'due' => $reminders->where('type', Message::TYPE_REMINDER)->count(),
            'sentToday' => Message::where('status', Message::STATUS_SENT)
                ->whereDate('sent_at', now()->toDateString())
                ->count(),
        ];

        return Inertia::render('Notifications/Index', [
            'reminders' => $reminders->values(),
            'stats' => $stats,
            'filter' => $type,
            'reminderDays' => $reminderDays,
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'vaccination_id' => ['required', 'exists:vaccinations,id'],
            'type' => ['nullable', 'in:reminder,missed'],
        ]);

        $vaccination = Vaccination::with(['child', 'vaccine'])->findOrFail($data['vaccination_id']);
        $type = $data['type'] ?? Message::TYPE_REMINDER;

        $message = $this->vaccinations->send($vaccination, $type, $request->user());

        return back()->with(
            $message->status === Message::STATUS_SENT ? 'success' : 'error',
            $message->status === Message::STATUS_SENT
                ? 'تم إرسال الرسالة إلى ولي الأمر.'
                : 'تعذر إرسال الرسالة: '.$message->error,
        );
    }

    public function sendAll(Request $request): RedirectResponse
    {
        $reminderDays = (int) config('services.vaccination.reminder_days', 7);

        $vaccinations = Vaccination::with(['child', 'vaccine'])
            ->whereNull('given_date')
            ->whereDate('due_date', '<=', now()->addDays($reminderDays)->toDateString())
            ->get();

        $sent = 0;
        $failed = 0;

        foreach ($vaccinations as $vaccination) {
            $type = $vaccination->due_date->isPast() ? Message::TYPE_MISSED : Message::TYPE_REMINDER;
            $message = $this->vaccinations->send($vaccination, $type, $request->user());

            $message->status === Message::STATUS_SENT ? $sent++ : $failed++;
        }

        return back()->with(
            $failed === 0 ? 'success' : 'error',
            "تم إرسال {$sent} رسالة، وفشل {$failed}.",
        );
    }

    public function log(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'status' => $request->string('status')->toString(),
            'type' => $request->string('type')->toString(),
        ];

        $messages = Message::query()
            ->with('child:id,full_name')
            ->when($filters['q'], fn ($q, $term) => $q->where(function ($sub) use ($term) {
                $sub->where('parent_name', 'like', "%{$term}%")
                    ->orWhere('parent_phone', 'like', "%{$term}%")
                    ->orWhere('body', 'like', "%{$term}%");
            }))
            ->when($filters['status'], fn ($q, $status) => $q->where('status', $status))
            ->when($filters['type'], fn ($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Message $m) => [
                'id' => $m->id,
                'child_name' => $m->child?->full_name,
                'parent_name' => $m->parent_name,
                'parent_phone' => $m->parent_phone,
                'type' => $m->type,
                'type_label' => $m->type_label,
                'body' => $m->body,
                'status' => $m->status,
                'status_label' => $m->status_label,
                'provider' => $m->provider,
                'error' => $m->error,
                'sent_at' => $m->sent_at?->toDateTimeString(),
                'created_at' => $m->created_at->toDateTimeString(),
            ]);

        return Inertia::render('Messages/Index', [
            'messages' => $messages,
            'filters' => $filters,
        ]);
    }

    public function destroy(Message $message): RedirectResponse
    {
        $message->delete();

        return back()->with('success', 'تم حذف السجل.');
    }
}
