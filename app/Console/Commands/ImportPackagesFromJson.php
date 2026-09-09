<?php

namespace App\Console\Commands;

use App\Models\Package;
use App\Models\PackageCategory;
use App\Models\PackageStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportPackagesFromJson extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'packages:import {file} {--update : Update existing packages}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import packages from a JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');
        $updateExisting = $this->option('update');

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $jsonContent = file_get_contents($filePath);
        $data = json_decode($jsonContent, true);

        if (!$data || !isset($data['packages'])) {
            $this->error('Invalid JSON format. Expected structure: {"packages": [...]}');
            return 1;
        }

        $packages = $data['packages'];
        $imported = 0;
        $updated = 0;
        $skipped = 0;

        // First, auto-create categories
        $this->info("Creating categories...");
        $uniqueCategories = collect($packages)
            ->pluck('category')
            ->filter()
            ->unique()
            ->values();

        foreach ($uniqueCategories as $categoryName) {
            $categoryKey = Str::slug($categoryName);
            PackageCategory::firstOrCreate(
                ['key' => $categoryKey],
                ['name' => $categoryName]
            );
        }
        $this->info("Categories created: " . $uniqueCategories->count());

        // Auto-create default package status
        PackageStatus::firstOrCreate(
            ['key' => 'available'],
            ['name' => 'Available']
        );
        $this->info("Default status ensured: Available");

        $this->info("Found " . count($packages) . " packages to import...");
        $bar = $this->output->createProgressBar(count($packages));
        $bar->start();

        foreach ($packages as $packageData) {
            $bar->advance();

            // Extract price from string like "€150"
            $price = $this->extractPrice($packageData['price'] ?? '0');
            
            // Use the ID from packages.js as the path (slug), fallback to generating from title
            $path = $packageData['id'] ?? Str::slug($packageData['title'] ?? 'untitled');

            // Check if package exists by number or path
            $existing = Package::where('number', $packageData['number'] ?? null)
                ->orWhere('path', $path)
                ->first();

            $packageAttributes = [
                'name' => $packageData['title'] ?? 'Untitled',
                'path' => $path,
                'number' => $packageData['number'] ?? null,
                'subtitle' => $packageData['subtitle'] ?? null,
                'description' => $packageData['description'] ?? null,
                'price' => $price,
                'currency' => 'EUR',
                'category' => $packageData['category'] ?? null,
                'age_group' => $packageData['ageGroup'] ?? null,
                'purpose' => $packageData['purpose'] ?? null,
                'preparation' => isset($packageData['preparation']) ? json_encode($packageData['preparation']) : null,
                'tests' => isset($packageData['tests']) ? json_encode($packageData['tests']) : null,
                'faq' => isset($packageData['faq']) ? json_encode($packageData['faq']) : null,
                'public_status' => 'public',
                'is_featured' => false,
            ];

            if ($existing) {
                if ($updateExisting) {
                    $existing->update($packageAttributes);
                    $updated++;
                } else {
                    $skipped++;
                }
            } else {
                Package::create($packageAttributes);
                $imported++;
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Import completed!");
        $this->info("Imported: {$imported}");
        if ($updateExisting) {
            $this->info("Updated: {$updated}");
        }
        if ($skipped > 0) {
            $this->warn("Skipped (already exists): {$skipped}");
            $this->info("Use --update flag to update existing packages");
        }

        return 0;
    }

    /**
     * Extract numeric price from string like "€150"
     */
    private function extractPrice(string $priceString): float
    {
        // Remove currency symbols and whitespace, keep numbers and decimal points
        $cleaned = preg_replace('/[^0-9.]/', '', $priceString);
        return floatval($cleaned) ?: 0.00;
    }
}
