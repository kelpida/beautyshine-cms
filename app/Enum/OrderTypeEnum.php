<?php

namespace App\Enum;

enum OrderTypeEnum: string
{
    case PICKUP = 'pickup';
    case DELIVERY = 'delivery';
}
