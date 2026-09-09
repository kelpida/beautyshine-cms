<?php

namespace App\Services;

use App\Models\Client;
use Illuminate\Support\Facades\Http;

class PaymentProviderService
{
    protected string $baseUrl;
    protected string $accountUrl;
    protected string $clientId;
    protected string $clientSecret;
    protected string $sourceCode;

    public function __construct()
    {
        $this->baseUrl = config('services.viva.base_url');
        $this->accountUrl = config('services.viva.account_url');
        $this->clientId = config('services.viva.client_id');
        $this->clientSecret = config('services.viva.client_secret');
        $this->sourceCode = config('services.viva.source_code');
    }

    /**
     * Get access token from Viva
     */
    protected function getAccessToken(): string
    {
        $response = Http::asForm()
            ->withBasicAuth($this->clientId, $this->clientSecret)
            ->post("{$this->accountUrl}/connect/token", [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->failed()) {
            throw new \Exception('Token request failed: ' . $response->body());
        }

        return $response->json()['access_token'];
    }

    /**
     * Create payment order
     */
    public function createOrder(int $amount, ?int $clientId): array
    {
        $client = Client::find($clientId);

        if (!$client) {
            throw new \Exception('Client not found');
        }

        $token = $this->getAccessToken();

        // ✅ assume amount already in cents
        $vivaAmount = $amount * 100;

        $response = Http::withToken($token)->post(
            "{$this->baseUrl}/checkout/v2/orders",
            [
                'amount' => $vivaAmount,
                "currency" => "EUR",
                'customer' => [
                    'email' => $client->email,
                    'fullName' => $client->name . ' ' . $client->surname,
                ],
                'sourceCode' => $this->sourceCode,
                "urlFail" => "https://staging.diagnostikilemesou.com/payment-failed"
            ]
        );

        if ($response->failed()) {
            throw new \Exception('Viva order failed: ' . $response->body());
        }

        $data = $response->json();

        return [
            'orderCode' => $data['orderCode'],
            'checkoutUrl' => config('services.viva.checkout_url') . $data['orderCode'],
        ];
    }
}
