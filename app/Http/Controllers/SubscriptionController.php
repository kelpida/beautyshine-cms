<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubscriptionRequest;
use App\Mail\SubscriptionNotification;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => Subscription::orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Store a newly subscribed email (API endpoint for public)
     */
    public function store(StoreSubscriptionRequest $request)
    {
        $subscription = Subscription::create([
            'email' => $request->validated()['email'],
        ]);

        // Send notification email to admin
        $adminEmail = config('mail.admin_address');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new SubscriptionNotification($subscription));
        }

        return response()->json([
            'success' => true,
            'message' => 'Subscription successful! Thank you for subscribing.',
            'data' => $subscription,
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $subscription = Subscription::findOrFail($id);
        $subscription->delete();

        return redirect()->back()->with('success', 'Subscription deleted successfully.');
    }

    /**
     * Export subscriptions as CSV
     */
    public function export()
    {
        $subscriptions = Subscription::orderBy('created_at', 'desc')->get();
        $callback = function() use ($subscriptions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Email', 'Subscribed At']);
            foreach ($subscriptions as $sub) {
                fputcsv($handle, [$sub->email, $sub->created_at]);
            }
            fclose($handle);
        };
        
        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="subscriptions.csv"',
        ]);
    }
}
