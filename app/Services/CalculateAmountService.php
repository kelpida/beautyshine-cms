<?php

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Package;
use App\Models\PromoCode;

class CalculateAmountService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function calculate(array $items, ?int $promoCodeId)
    {
        $itemsAmount = $this->itemsAmount($items);

        $discountPrice = $this->discountPrice($promoCodeId, $itemsAmount);

        $totalAmount = $itemsAmount - $discountPrice;

        return [$itemsAmount, $discountPrice, $totalAmount];
    }

    protected function itemsAmount(array $items): float
    {
        $amount = 0;

        foreach ($items as $item) {
            $package = Package::find($item['item_id']);

            if (!$package) {
                continue; // or throw exception
            }
            $totalItemAmount = $package->price * $item['quantity'];

            $amount += $totalItemAmount;
        }

        return $amount;
    }

    protected function discountPrice(?int $promoCodeId, float $amount): float
    {
        $discountPrice = 0;

        if ($promoCodeId) {
            $promoData = PromoCode::find($promoCodeId);

            if ($promoData && $promoData->is_active) {

                switch ($promoData->discount_type) {
                    case 'percent':
                        $discountPrice = $amount * $promoData->discount_value / 100;
                        break;

                    case 'amount':
                        $discountPrice = $promoData->discount_value;
                        break;
                }

                // ✅ correct increment
                $promoData->increment('used_count');
            }
        }

        return $discountPrice;
    }
}
