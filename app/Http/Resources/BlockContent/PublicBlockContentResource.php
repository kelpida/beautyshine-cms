<?php

namespace App\Http\Resources\BlockContent;

use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\UploadFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicBlockContentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * 
     * Returns content organized by block label and locale:
     * [
     *   'title' => [ 'en' => 'Main Title', 'gr' => 'Κύριος Τίτλος' ],
     *   'subtitle' => [ 'en' => 'Subtitle Text', 'gr' => 'Υπότιτλος' ],
     * ]
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $transformedContent = [];
        $blocks = $this->content ?? [];

        foreach ($blocks as $block) {
            $blockKey = !empty($block['label'])
                ? $block['label']
                : ($block['type'] ?? 'block') . '_' . ($block['id'] ?? uniqid());

            $localeContent = [];

            if (isset($block['content']) && is_array($block['content'])) {
                foreach ($block['content'] as $locale => $content) {

                    // Locale content must be an array
                    if (!is_array($content)) {
                        $localeContent[$locale] = $content;
                        continue;
                    }

                    // 🔹 Convert image_id → UploadFileResource
                    if (array_key_exists('image_id', $content)) {
                        $image = $content['image_id']
                            ? UploadFile::find($content['image_id'])
                            : null;

                        $content['image'] = $image
                            ? new UploadFileResource($image)
                            : null;

                        unset($content['image_id']); // recommended
                    }

                    $localeContent[$locale] = $content;
                }
            }

            $transformedContent[$blockKey] = $localeContent;
        }

        return $transformedContent;
    }
}
