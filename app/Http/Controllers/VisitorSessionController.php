<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VisitorSessionController extends Controller
{
    public function store()
    {
        $visitorId = (string) Str::uuid();

        return response()->json([
            'visitor_id' => $visitorId,
        ]);
    }
}
