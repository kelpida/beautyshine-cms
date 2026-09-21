<?php

namespace App\Enum;

enum PaymentMethodEnum: string
{
    case CASH = 'cash';
    case CARD = 'card';
    case BANK_TRANSFER = 'bank_transfer';
    case CASH_ON_DELIVERY = 'cash_on_delivery';
    case APPLE_PAY = 'apple_pay';
    case GOOGLE_PAY = 'google_pay';
}
