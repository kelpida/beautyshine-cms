<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VivaWebhookController extends Controller
{
    public function handle(Request $request)
    {
        if ($request->isMethod('post')) {

            $payload = $request->all();

            Log::info('Viva webhook received', $payload);

            $eventType = $payload['EventTypeId'] ?? null;
            $data = $payload['EventData'] ?? [];

            if ($eventType == 1796) {

                $orderCode = (string) ($data['OrderCode'] ?? null);
                $transactionId = $data['TransactionId'] ?? null;
                $statusId = $data['StatusId'] ?? null;

                DB::transaction(function () use ($orderCode, $transactionId, $statusId) {

                    $transaction = Transaction::where('order_code', $orderCode)->first();

                    if (!$transaction) {
                        Log::error("Transaction not found: {$orderCode}");
                        return;
                    }

                    // 🔁 prevent duplicate processing
                    if ($transaction->status === 'captured') {
                        return;
                    }

                    // 🎯 SUCCESS CASE
                    if (in_array($statusId, ['F', 'C'])) {

                        $transaction->update([
                            'transaction_id' => $transactionId,
                            'status' => 'captured',
                        ]);

                        $transaction->order->update([
                            'status' => Order::STATUS_PAID,
                        ]);

                        // Send admin notification email after payment is captured
                        try {
                            $order = $transaction->order->fresh(['client']);
                            $client = $order->client;
                            $adminEmail = config('mail.admin_address', env('CMS_ADMIN_EMAIL', 'info@pzalab.com.cy'));
                            \Mail::to($adminEmail)->send(new \App\Mail\NewOrderAdminNotificationMail($order, $client));
                        } catch (\Exception $e) {
                            Log::error('Admin order email notification failed: ' . $e->getMessage());
                        }
                    }

                    // ❌ FAILED CASE
                    elseif (in_array($statusId, ['E', 'X'])) {

                        $transaction->update([
                            'transaction_id' => $transactionId,
                            'status' => 'failed',
                        ]);

                        $transaction->order->update([
                            'status' => Order::STATUS_CANCELLED,
                        ]);
                    }

                    // 💸 REFUND
                    elseif ($statusId === 'R') {

                        $transaction->update([
                            'status' => 'refunded',
                        ]);

                        $transaction->order->update([
                            'status' => Order::STATUS_CANCELLED,
                        ]);
                    }
                });
            }

            return response()->json(['message' => 'ok'], 200);
        }

        // 🔹 GET part (verification)
        $merchantId = env('VIVA_MERCHANT_ID');
        $apiKey = env('VIVA_API_KEY');

        $credentials = base64_encode($merchantId . ':' . $apiKey);

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . $credentials
        ])->get('https://www.vivapayments.com/api/messages/config/token');

        $key = $response->json('Key');

        Log::info('Viva webhook verification key', [
            'key' => $key,
        ]);

        return response()->json([
            'key' => $key,
        ]);
    }
}
