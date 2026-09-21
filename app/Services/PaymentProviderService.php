<?php

namespace App\Services;

use App\Models\Client;
use App\Models\PaymentProvider;
use Illuminate\Support\Facades\Http;

class PaymentProviderService
{
    protected ?PaymentProvider $provider = null;
    protected string $baseUrl;
    protected string $accountUrl;
    protected string $checkoutUrl;
    protected string $clientId;
    protected string $clientSecret;
    protected string $sourceCode;
    protected string $merchantId;

    public function __construct(?PaymentProvider $provider = null)
    {
        // 1. Fetch active Viva Wallet provider from DB (or use injected instance)
        $this->provider = $provider ?? PaymentProvider::active()
            ->where('code', PaymentProvider::CODE_VIVA)
            ->first();

        // 2. Read credentials from DB (fallback to config/env if not set in DB)
        $this->clientId     = $this->provider?->client_id ?: (config('services.viva.client_id') ?? '');
        $this->clientSecret = $this->provider?->client_secret ?: (config('services.viva.client_secret') ?? '');
        $this->sourceCode   = $this->provider?->source_code ?: (config('services.viva.source_code') ?? '');
        $this->merchantId   = $this->provider?->merchant_id ?: (config('services.viva.merchant_id') ?? '');

        // 3. Determine environment URLs (Production vs Demo/Sandbox)
        $isProduction = (bool) ($this->provider?->is_production ?? false);

        if ($this->provider) {
            $this->accountUrl = $isProduction
                ? 'https://accounts.vivapayments.com'
                : 'https://demo-accounts.vivapayments.com';

            $this->baseUrl = $isProduction
                ? 'https://api.vivapayments.com'
                : 'https://demo-api.vivapayments.com';

            $this->checkoutUrl = $isProduction
                ? 'https://www.vivawallet.com/web/checkout?ref='
                : 'https://demo.vivawallet.com/web/checkout?ref=';
        } else {
            // Fallbacks from config
            $this->accountUrl  = config('services.viva.account_url') ?: 'https://demo-accounts.vivapayments.com';
            $this->baseUrl     = config('services.viva.base_url') ?: 'https://demo-api.vivapayments.com';
            $this->checkoutUrl = config('services.viva.checkout_url') ?: 'https://demo.vivawallet.com/web/checkout?ref=';
        }
    }

    /**
     * Check if Viva credentials are configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->clientId) && !empty($this->clientSecret);
    }

    /**
     * Get active PaymentProvider model
     */
    public function getProvider(): ?PaymentProvider
    {
        return $this->provider;
    }

    /**
     * Get access token from Viva
     */
    protected function getAccessToken(): string
    {
        if (!$this->isConfigured()) {
            throw new \Exception('Viva Wallet is not configured with client_id and client_secret.');
        }

        $response = Http::asForm()
            ->withBasicAuth($this->clientId, $this->clientSecret)
            ->post("{$this->accountUrl}/connect/token", [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->failed()) {
            throw new \Exception('Viva token request failed: ' . $response->body());
        }

        return $response->json()['access_token'] ?? throw new \Exception('Access token missing from Viva response.');
    }

    /**
     * Create payment order
     */
    public function createOrder(int|float $amount, ?int $clientId): array
    {
        $client = $clientId ? Client::find($clientId) : null;

        if (!$client) {
            throw new \Exception('Client not found for payment processing');
        }

        $token = $this->getAccessToken();

        // Convert amount to cents (integer)
        $vivaAmount = (int) round($amount * 100);

        $failUrl = config('services.viva.url_fail') ?: url('/payment-failed');

        $payload = [
            'amount' => $vivaAmount,
            'currency' => 'EUR',
            'customer' => [
                'email' => $client->email,
                'fullName' => trim($client->name . ' ' . ($client->surname ?? '')),
                'phone' => $client->phone ?? null,
            ],
            'sourceCode' => $this->sourceCode,
            'urlFail' => $failUrl,
        ];

        // Merchant ID (optional if linked to token's client)
        if (!empty($this->merchantId)) {
            $payload['merchantId'] = $this->merchantId;
        }

        $response = Http::withToken($token)->post(
            "{$this->baseUrl}/checkout/v2/orders",
            $payload
        );

        if ($response->failed()) {
            throw new \Exception('Viva order failed: ' . $response->body());
        }

        $data = $response->json();

        return [
            'orderCode' => $data['orderCode'] ?? null,
            'checkoutUrl' => $this->checkoutUrl . ($data['orderCode'] ?? ''),
        ];
    }
}
