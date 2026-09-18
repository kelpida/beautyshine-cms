<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Page;
use App\Models\BlockContent;
use Illuminate\Support\Facades\File;

class ImportPagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'content:import-pages {file=database/seeders/data/pages_export.json}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import pages and block contents from a JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = base_path($this->argument('file'));

        if (!File::exists($filePath)) {
            $this->error("File not found at: {$filePath}");
            return 1;
        }

        $jsonContent = File::get($filePath);
        $pages = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON file format.');
            return 1;
        }

        $this->info('Starting page import...');

        foreach ($pages as $pageData) {
            $page = Page::updateOrCreate(
                ['path' => $pageData['path']],
                [
                    'title' => $pageData['title'],
                    'page_name' => $pageData['page_name'],
                ]
            );

            $this->info("Imported Page: {$page->title}");

            if (isset($pageData['blocks']) && is_array($pageData['blocks'])) {
                foreach ($pageData['blocks'] as $blockData) {
                    BlockContent::updateOrCreate(
                        [
                            'page_id' => $page->id,
                            'component_name' => $blockData['component_name'],
                        ],
                        [
                            'title' => $blockData['title'],
                            'content' => $blockData['content'],
                        ]
                    );
                    $this->line("  -> Imported Block: {$blockData['title']} ({$blockData['component_name']})");
                }
            }
        }

        $this->info('Successfully imported all pages and blocks!');
        return 0;
    }
}
