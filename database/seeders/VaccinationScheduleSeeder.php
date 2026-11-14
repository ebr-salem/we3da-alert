<?php

namespace Database\Seeders;

use App\Models\Vaccine;
use Illuminate\Database\Seeder;

class VaccinationScheduleSeeder extends Seeder
{
    /**
     * جدول التطعيمات الأساسي المعتمد (تقريبي).
     *
     * @var array<int, array{name: string, description: string, doses: array<int, array{age: int, note?: string}>}>
     */
    protected array $schedule = [
        [
            'name' => 'الدرن (BCG)',
            'description' => 'يُعطى عند الولادة لحماية الطفل من مرض الدرن.',
            'doses' => [
                ['age' => 0, 'note' => 'جرعة واحدة عند الولادة'],
            ],
        ],
        [
            'name' => 'التهاب الكبد الوبائي ب (HBV)',
            'description' => 'حماية الطفل من التهاب الكبد الفيروسي ب.',
            'doses' => [
                ['age' => 0, 'note' => 'الجرعة الصفرية عند الولادة'],
                ['age' => 2, 'note' => 'الجرعة الأولى'],
                ['age' => 6, 'note' => 'الجرعة الثانية'],
            ],
        ],
        [
            'name' => 'شلل الأطفال الفموي (OPV)',
            'description' => 'حماية الطفل من مرض شلل الأطفال.',
            'doses' => [
                ['age' => 0, 'note' => 'الجرعة الصفرية'],
                ['age' => 2, 'note' => 'الجرعة الأولى'],
                ['age' => 4, 'note' => 'الجرعة الثانية'],
                ['age' => 6, 'note' => 'الجرعة الثالثة'],
                ['age' => 18, 'note' => 'الجرعة المنشطة'],
            ],
        ],
        [
            'name' => 'الثلاثي البكتيري (DTP)',
            'description' => 'حماية من الدفتيريا والتيتانوس والسعال الديكي.',
            'doses' => [
                ['age' => 2, 'note' => 'الجرعة الأولى'],
                ['age' => 4, 'note' => 'الجرعة الثانية'],
                ['age' => 6, 'note' => 'الجرعة الثالثة'],
                ['age' => 18, 'note' => 'الجرعة المنشطة'],
            ],
        ],
        [
            'name' => 'المكورات الرئوية (PCV)',
            'description' => 'حماية الطفل من الالتهاب الرئوي والتهاب السحايا.',
            'doses' => [
                ['age' => 2, 'note' => 'الجرعة الأولى'],
                ['age' => 4, 'note' => 'الجرعة الثانية'],
                ['age' => 6, 'note' => 'الجرعة الثالثة'],
            ],
        ],
        [
            'name' => 'شلل الأطفال بالحقن (IPV)',
            'description' => 'جرعة إضافية من لقاح شلل الأطفال.',
            'doses' => [
                ['age' => 4, 'note' => 'جرعة واحدة'],
            ],
        ],
        [
            'name' => 'الثلاثي الفيروسي (MMR)',
            'description' => 'حماية من الحصبة والنكاف والحصبة الألمانية.',
            'doses' => [
                ['age' => 12, 'note' => 'الجرعة الأولى'],
                ['age' => 18, 'note' => 'الجرعة الثانية'],
            ],
        ],
        [
            'name' => 'التهاب الكبد الوبائي أ (HAV)',
            'description' => 'حماية الطفل من التهاب الكبد الفيروسي أ.',
            'doses' => [
                ['age' => 12, 'note' => 'الجرعة الأولى'],
                ['age' => 18, 'note' => 'الجرعة الثانية'],
            ],
        ],
    ];

    public function run(): void
    {
        foreach ($this->schedule as $item) {
            $vaccine = Vaccine::updateOrCreate(
                ['name' => $item['name']],
                ['description' => $item['description'], 'is_active' => true],
            );

            foreach ($item['doses'] as $index => $dose) {
                $vaccine->doses()->updateOrCreate(
                    ['dose_number' => $index + 1],
                    [
                        'age_in_months' => $dose['age'],
                        'description' => $dose['note'] ?? null,
                    ],
                );
            }
        }
    }
}
