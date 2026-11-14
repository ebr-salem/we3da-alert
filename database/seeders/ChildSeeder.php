<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Services\VaccinationService;
use Illuminate\Database\Seeder;

class ChildSeeder extends Seeder
{
    /**
     * @var array<int, string>
     */
    protected array $maleNames = [
        'أحمد محمد', 'يوسف علي', 'عمر حسن', 'مصطفى إبراهيم', 'آدم محمود',
        'مروان سامي', 'زياد خالد', 'كريم فتحي', 'حمزة رمضان', 'سيف الدين',
    ];

    /**
     * @var array<int, string>
     */
    protected array $femaleNames = [
        'ملك أحمد', 'جنى محمد', 'ليان عمر', 'حبيبة سعيد', 'نور ياسر',
        'مريم طارق', 'سلمى حسام', 'رقية عادل', 'لين محمد', 'تاليا عمرو',
    ];

    /**
     * @var array<int, string>
     */
    protected array $parentNames = [
        'محمد عبد الله', 'علي حسن', 'إبراهيم سعيد', 'حسام الدين', 'طارق فؤاد',
        'سامي رشاد', 'خالد منير', 'ياسر صلاح', 'عادل كمال', 'فتحي محروس',
    ];

    /**
     * @var array<int, string>
     */
    protected array $areas = [
        'شارع الجمهورية', 'شارع النيل', 'شارع المحطة', 'الحي الشرقي',
        'الحي الغربي', 'شارع المستشفى', 'منطقة الزهور',
    ];

    public function run(VaccinationService $vaccinations): void
    {
        if (Child::exists()) {
            return;
        }

        for ($i = 0; $i < 24; $i++) {
            $isFemale = $i % 2 === 1;

            $names = $isFemale ? $this->femaleNames : $this->maleNames;
            $fullName = $names[$i % count($names)];

            $parentName = $this->parentNames[$i % count($this->parentNames)];
            $phone = '01'.random_int(0, 2).random_int(10000000, 99999999);

            $child = Child::create([
                'full_name' => $fullName.' '.($i + 1),
                'birth_date' => now()->subMonths(random_int(0, 30))->subDays(random_int(0, 28)),
                'gender' => $isFemale ? 'female' : 'male',
                'national_id' => (string) random_int(28000000000000, 32000000000000),
                'parent_name' => $parentName,
                'parent_phone' => $phone,
                'address' => $this->areas[$i % count($this->areas)],
                'notes' => $i % 5 === 0 ? 'يحتاج متابعة دورية' : null,
                'is_active' => true,
            ]);

            $vaccinations->syncChild($child);
        }
    }
}
