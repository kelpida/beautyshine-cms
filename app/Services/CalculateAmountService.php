<?php

namespace App\Services;

use App\Models\Eshop\Product;
use App\Models\Eshop\ProductAttributeOption;
use App\Models\Eshop\ProductVariation;
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

        $totalAmount = max(0, $itemsAmount - $discountPrice);

        return [$itemsAmount, $discountPrice, $totalAmount];
    }

    protected function itemsAmount(array $items): float
    {
        $amount = 0;

        foreach ($items as $item) {
            $productId = $item['product_id'] ?? $item['item_id'] ?? null;
            $variationId = $item['variation_id'] ?? null;
            $quantity = (int) ($item['quantity'] ?? 1);

            $price = 0;

            // 1. If explicit price is provided
            if (isset($item['price']) && is_numeric($item['price'])) {
                $price = (float) $item['price'];
            }
            // 2. If variation is specified
            elseif ($variationId) {
                $variation = ProductVariation::find($variationId);
                if ($variation) {
                    $price = $variation->sale_price !== null ? (float) $variation->sale_price : (float) $variation->price;
                }
            }
            // 3. Fallback to product
            elseif ($productId) {
                $product = Product::find($productId);
                if ($product) {
                    $price = $product->sale_price !== null ? (float) $product->sale_price : (float) $product->base_price;
                }
            }

            // 4. Add option price modifiers if any
            if (!empty($item['options']) && is_array($item['options'])) {
                foreach ($item['options'] as $opt) {
                    if (isset($opt['price_modifier']) && is_numeric($opt['price_modifier'])) {
                        $price += (float) $opt['price_modifier'];
                    } elseif (!empty($opt['option_id'])) {
                        $attrOpt = ProductAttributeOption::find($opt['option_id']);
                        if ($attrOpt && $attrOpt->extra_price) {
                            $price += (float) $attrOpt->extra_price;
                        }
                    }
                }
            }

            $amount += ($price * $quantity);
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
                        $discountPrice = (float) $promoData->discount_value;
                        break;
                }

                // Cap discount at max_discount_amount if specified
                if (!empty($promoData->max_discount_amount) && $discountPrice > (float) $promoData->max_discount_amount) {
                    $discountPrice = (float) $promoData->max_discount_amount;
                }

                // Increment used count
                $promoData->increment('used_count');
            }
        }

        return $discountPrice;
    }
}
