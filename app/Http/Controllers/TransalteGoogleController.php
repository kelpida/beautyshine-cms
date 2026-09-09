<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TransalteGoogleController extends Controller
{
    public function translate(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'locale' => 'required|string',
        ]);

        $apiKey = env('GOOGLE_API_KEY');

        $response = Http::post("https://translation.googleapis.com/language/translate/v2?key={$apiKey}", [
            'q' => $request->text,
            'target' => $request->locale,
        ]);

        return $response->json();
    }
}
