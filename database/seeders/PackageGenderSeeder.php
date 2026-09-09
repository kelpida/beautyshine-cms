<?php

namespace Database\Seeders;

use App\Models\PackageGender;
use App\Models\PackageGenderTranslate;
use Illuminate\Database\Seeder;

class PackageGenderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $genders = [
            ['name' => 'Male', 'key' => 'male'],
            ['name' => 'Female', 'key' => 'female'],
            ['name' => 'Unisex', 'key' => 'unisex'],
        ];

        foreach ($genders as $gender) {
            $packageGender = PackageGender::create([
                'name' => $gender['name'],
                'key' => $gender['key'],
                'order_id' => 0,
            ]);

            // Add English translation
            PackageGenderTranslate::create([
                'package_gender_id' => $packageGender->id,
                'language_id' => 1, // Assuming English is ID 1
                'name' => $gender['name'],
            ]);
        }
    }
}
