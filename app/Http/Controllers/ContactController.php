<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\Subscription;
use App\Mail\SubscriptionNotification;
use Illuminate\Support\Facades\Validator;
use App\Mail\ContactFormMail;
use App\Mail\InterestedFormMail;
use App\Http\Controllers\Controller;
use Exception;

class ContactController extends Controller
{
    /**
     * Handle contact form submission
     */
    /**
     * Handle newsletter subscription
     */
    public function subscribe(Request $request)
    {
        // Validate email
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:subscriptions,email',
            'recaptchaToken' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Optional reCAPTCHA verification (same as other forms)
        $recaptchaSecret = env('RECAPTCHA_SECRET_KEY');
        if ($recaptchaSecret && $request->recaptchaToken) {
            $recaptchaResponse = file_get_contents(
                'https://www.google.com/recaptcha/api/siteverify?secret=' . $recaptchaSecret . '&response=' . $request->recaptchaToken
            );
            $recaptchaData = json_decode($recaptchaResponse);
            if (!$recaptchaData->success) {
                return response()->json([
                    'success' => false,
                    'message' => 'reCAPTCHA verification failed.',
                ], 422);
            }
        }

        // Store subscription
        $subscription = \App\Models\Subscription::create([
            'email' => $request->email,
        ]);

        // Send admin notification
        $adminEmail = env('CMS_ADMIN_EMAIL', 'info@pzalab.com.cy');
        Mail::to($adminEmail)->send(new \App\Mail\SubscriptionNotification($subscription));

        return response()->json([
            'success' => true,
            'message' => 'Subscribed successfully!',
        ]);
    }

    /**
     * Export subscription list as CSV (admin only)
     */
    public function exportSubscriptions(Request $request)
    {
        // Simple protection – you can replace with auth middleware later
        $secret = env('SUBSCRIPTION_EXPORT_SECRET');
        if ($secret && $request->query('secret') !== $secret) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscriptions = \App\Models\Subscription::orderBy('created_at', 'desc')->get();
        $callback = function () use ($subscriptions) {
            $handle = fopen('php://output', 'w');
            // Header row
            fputcsv($handle, ['Email', 'Subscribed At']);
            foreach ($subscriptions as $sub) {
                fputcsv($handle, [$sub->email, $sub->created_at]);
            }
            fclose($handle);
        };
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="subscriptions.csv"',
        ];
        return response()->stream($callback, 200, $headers);
    }

    public function sendContactForm(Request $request) // Renamed to match route
    {
        Log::channel('mail')->info('Contact form submission received', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:2000',
            'inquiryType' => 'nullable|string|max:50',
            'recaptchaToken' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::channel('mail')->warning('Contact form validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verify reCAPTCHA (optional - can be disabled for testing)
        $recaptchaSecret = env('RECAPTCHA_SECRET_KEY');
        if ($recaptchaSecret && $request->recaptchaToken) {
            $recaptchaResponse = file_get_contents(
                'https://www.google.com/recaptcha/api/siteverify?secret=' . $recaptchaSecret .
                    '&response=' . $request->recaptchaToken
            );
            $recaptchaData = json_decode($recaptchaResponse);

            if (!$recaptchaData->success) {
                Log::channel('mail')->warning('reCAPTCHA verification failed', ['data' => $recaptchaData]);
                return response()->json([
                    'success' => false,
                    'message' => 'reCAPTCHA verification failed. Please try again.'
                ], 422);
            }
        }

        $formData = $request->only(['name', 'email', 'phone', 'message', 'inquiryType']);

        try {
            $recipientEmail = 'info@pzalab.com.cy';
            Log::channel('mail')->info('Attempting to send contact email', [
                'recipient' => $recipientEmail,
                'from' => $formData['email']
            ]);

            // Send email to admin
            Mail::to($recipientEmail)
                ->send(new ContactFormMail($formData));

            Log::channel('mail')->info('Contact email sent successfully', ['recipient' => $recipientEmail]);

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully!'
            ]);
        } catch (Exception $e) {
            Log::channel('mail')->error('Failed to send contact email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle interested/property inquiry form submission
     */
    public function sendInterestedForm(Request $request)
    {
        Log::channel('mail')->info('Interested form submission received', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'propertyId' => 'nullable|string|max:100',
            'viewProperty' => 'nullable|boolean',
            'recaptchaToken' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::channel('mail')->warning('Interested form validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify reCAPTCHA (optional - can be disabled for testing)
        $recaptchaSecret = env('RECAPTCHA_SECRET_KEY');
        if ($recaptchaSecret && $request->recaptchaToken) {
            $recaptchaResponse = file_get_contents(
                'https://www.google.com/recaptcha/api/siteverify?secret=' . $recaptchaSecret .
                    '&response=' . $request->recaptchaToken
            );
            $recaptchaData = json_decode($recaptchaResponse);

            if (!$recaptchaData->success) {
                Log::channel('mail')->warning('reCAPTCHA verification failed', ['data' => $recaptchaData]);
                return response()->json([
                    'success' => false,
                    'message' => 'reCAPTCHA verification failed. Please try again.'
                ], 422);
            }
        }

        $formData = $request->only(['name', 'email', 'phone', 'propertyId', 'viewProperty']);

        try {
            $recipientEmail = env('CMS_ADMIN_EMAIL', 'info@pzalab.com.cy');
            Log::channel('mail')->info('Attempting to send interested email', [
                'recipient' => $recipientEmail,
                'from' => $formData['email']
            ]);

            // Send email to admin
            Mail::to($recipientEmail)
                ->send(new InterestedFormMail($formData));

            Log::channel('mail')->info('Interested email sent successfully', ['recipient' => $recipientEmail]);

            return response()->json([
                'success' => true,
                'message' => 'Your interest has been submitted successfully!'
            ]);
        } catch (\Exception $e) {
            Log::channel('mail')->error('Failed to send interested email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
