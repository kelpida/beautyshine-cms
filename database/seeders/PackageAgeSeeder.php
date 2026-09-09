<?php

namespace Database\Seeders;

use App\Models\PackageAge;
use App\Models\PackageAgeTranslate;
use Illuminate\Database\Seeder;

class PackageAgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ages = [
            ['name' => '18+', 'key' => '18+'],
            ['name' => '40+', 'key' => '40+'],
            ['name' => '50+', 'key' => '50+'],
            ['name' => '65+', 'key' => '65+'],
            ['name' => 'All Ages', 'key' => 'all-ages'],
        ];

        foreach ($ages as $age) {
            $packageAge = PackageAge::create([
                'name' => $age['name'],
                'key' => $age['key'],
                'order_id' => 0,
            ]);

            // Add English translation
            PackageAgeTranslate::create([
                'package_age_id' => $packageAge->id,
                'language_id' => 1, // Assuming English is ID 1
                'name' => $age['name'],
            ]);
        }
    }
}
