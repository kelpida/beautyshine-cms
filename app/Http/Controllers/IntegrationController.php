<?php

namespace App\Http\Controllers;

use App\Http\Resources\Integration\PublicIntegrationResource;
use App\Models\Integration;
use App\Http\Requests\Integration\StoreIntegrationRequest;
use App\Http\Requests\Integration\UpdateIntegrationRequest;
use App\Http\Resources\Integration\IntegrationResource;
use Inertia\Inertia;

class IntegrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $integration = Integration::all();
        return Inertia::render("Integration/IntegrationIndexPage", [
            "integrations" => IntegrationResource::collection($integration)
        ]);
    }
    public function publicIndex()
    {
        $integration = Integration::where('enabled', true)->get();
        return response()->json(PublicIntegrationResource::collection($integration));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("Integration/IntegrationFormPage");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIntegrationRequest $request)
    {
        $integrationValidation = $request->validated();
        $integrationValidation['order_id'] = Integration::count() + 1;
        Integration::create($integrationValidation);
        return redirect()->route("integrations.index")->with("success", "Integration created successfully.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Integration $integration)
    {
        return Inertia::render("Integration/IntegrationFormPage", [
            "integration" => IntegrationResource::make($integration)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Integration $integration)
    {
        return Inertia::render("Integration/IntegrationFormPage", [
            "integration" => IntegrationResource::make($integration)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateIntegrationRequest $request, Integration $integration)
    {
        $integrationValidation = $request->validated();
        $integration->update($integrationValidation);
        return redirect()->route("integrations.index")->with("success", "Integration updated successfully.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Integration $integration)
    {
        $integration->delete();
        return redirect()->route("integrations.index")->with("success", "Integration deleted successfully.");
    }
}
