<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Placed</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f8fb; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f8fb; padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px; max-width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
                    <tr>
                        <td style="background-color:#1C587E; padding:24px; text-align:center;">
                            <img src="{{ asset('images/pzagapiou-lab-logo-white.png') }}" alt="P.Z. Agapiou Clinical Pathology Laboratory" style="max-width:260px; width:100%; height:auto; display:inline-block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 28px 12px;">
                            <h1 style="margin:0; font-size:24px; line-height:1.3; color:#1C587E;">New Order Placed</h1>
                            <p style="margin:12px 0 0; font-size:15px; line-height:1.6; color:#4b5563;">
                                A new order has been placed by {{ $client->name }} {{ $client->surname }}.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:8px 28px 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden;">
                                <tr>
                                    <td style="width:140px; padding:14px 16px; background-color:#f9fafb; font-size:14px; font-weight:700; color:#1f2937;">Order Reference</td>
                                    <td style="padding:14px 16px; font-size:14px; color:#111827;">{{ $order->latestTransaction->order_code ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <td style="width:140px; padding:14px 16px; background-color:#f9fafb; font-size:14px; font-weight:700; color:#1f2937;">Total</td>
                                    <td style="padding:14px 16px; font-size:14px; color:#111827;">€{{ number_format($order->total_amount, 2) }}</td>
                                </tr>
                                <tr>
                                    <td style="width:140px; padding:14px 16px; background-color:#f9fafb; font-size:14px; font-weight:700; color:#1f2937;">Client Email</td>
                                    <td style="padding:14px 16px; font-size:14px; color:#111827;">{{ $client->email }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 28px 28px;">
                            <p style="font-size:15px; color:#4b5563;">View this order in the admin panel for more details.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
