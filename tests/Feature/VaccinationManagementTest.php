<?php

namespace Tests\Feature;

use App\Models\Child;
use App\Models\Message;
use App\Models\User;
use App\Models\Vaccination;
use App\Models\Vaccine;
use App\Services\VaccinationService;
use Database\Seeders\VaccinationScheduleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VaccinationManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(VaccinationScheduleSeeder::class);
    }

    public function test_staff_can_view_the_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_creating_a_child_generates_vaccination_records(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/children', [
            'full_name' => 'أحمد محمد',
            'birth_date' => now()->subMonths(3)->toDateString(),
            'gender' => 'male',
            'parent_name' => 'محمد عبد الله',
            'parent_phone' => '01012345678',
            'is_active' => true,
        ]);

        $child = Child::first();

        $response->assertRedirect(route('children.show', $child));
        $this->assertGreaterThan(0, $child->vaccinations()->count());
    }

    public function test_vaccination_service_builds_an_arabic_reminder_message(): void
    {
        $child = Child::create([
            'full_name' => 'ملك أحمد',
            'birth_date' => now()->subMonths(2),
            'gender' => 'female',
            'parent_name' => 'أحمد سعيد',
            'parent_phone' => '01098765432',
            'is_active' => true,
        ]);

        $service = app(VaccinationService::class);
        $service->syncChild($child);

        $vaccination = $child->vaccinations()->with('vaccine')->first();

        $body = $service->buildMessage($child, $vaccination, Message::TYPE_REMINDER);

        $this->assertStringContainsString('ملك أحمد', $body);
        $this->assertStringContainsString('أحمد سعيد', $body);
    }

    public function test_due_vaccinations_are_detected(): void
    {
        $child = Child::create([
            'full_name' => 'يوسف علي',
            'birth_date' => now()->subMonths(2)->addDays(3),
            'gender' => 'male',
            'parent_name' => 'علي حسن',
            'parent_phone' => '01111111111',
            'is_active' => true,
        ]);

        app(VaccinationService::class)->syncChild($child);

        $due = Vaccination::due()->where('child_id', $child->id)->count();

        $this->assertGreaterThan(0, $due);
        $this->assertGreaterThanOrEqual(1, Vaccine::count());
    }
}
