<?php

namespace App\Http\Controllers;

use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\UploadFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UploadFilesController extends Controller
{
    public function index()
    {
        $files = UploadFile::all();
        return Inertia::render('UploadFiles/UploadFileIndexPage', [
            'files' => UploadFileResource::collection($files),
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $mimeType = $uploadedFile->getClientMimeType();
        $type = 'file';
        if (str_starts_with($mimeType, 'image/')) {
            $type = 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            $type = 'video';
        }

        // Store file in 'public/uploads'
        $path = $uploadedFile->store('uploads', 'public');

        $upload = UploadFile::create([
            'name' => pathinfo($originalName, PATHINFO_FILENAME),
            'alt' => null,
            'path' => $path,
            'type' => $type,
            'size' => $uploadedFile->getSize(),
            'mime_type' => $mimeType,
            'user_id' => auth()->id(),
        ]);

        return new UploadFileResource($upload);
    }
}
