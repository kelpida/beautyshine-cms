<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
                            <h1 style="margin:0; font-size:24px; line-height:1.3; color:#1C587E;">Reset Your Password</h1>
                            <p style="margin:12px 0 0; font-size:15px; line-height:1.6; color:#4b5563;">
                                Hi {{ $user->name }}, we received a request to reset your patient account password.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 28px 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden;">
                                <tr>
                                    <td style="width:140px; padding:14px 16px; background-color:#f9fafb; font-size:14px; font-weight:700; color:#1f2937;">Email</td>
                                    <td style="padding:14px 16px; font-size:14px; color:#111827;">{{ $user->email }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 28px 24px; text-align:center;">
                            <a href="{{ $resetUrl }}" style="display:inline-block; background-color:#1C587E; color:#ffffff; text-decoration:none; padding:10px 20px; border-radius:8px; font-size:14px; font-weight:700;">Reset Password</a>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 28px 28px;">
                            <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280;">
                                If you did not request this reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 28px;">
                            <p style="margin:0; font-size:13px; line-height:1.6; color:#374151; font-weight:700;">P.Z. Agapiou Clinical Pathology Laboratory</p>
                            <p style="margin:8px 0 0; font-size:12px; line-height:1.7; color:#4b5563;">
                                Central Laboratory: Sotirios Tsirou 9, Tsekis Court, Floor 11, 3041 Limassol, Cyprus<br>
                                Tel: (+357) 25 361 373 • Fax: (+357) 25 384 878 • Email: <a href="mailto:info@pzalab.com.cy" style="color:#1C587E; text-decoration:none;">info@pzalab.com.cy</a>
                            </p>
                            <p style="margin:10px 0 0; font-size:12px; color:#4b5563;">
                                Website: <a href="{{ config('app.frontend_url') }}" style="color:#1C587E; text-decoration:none;">{{ config('app.frontend_url') }}</a>
                            </p>
                            <p style="margin:10px 0 0; font-size:11px; color:#6b7280;">© {{ date('Y') }} P.Z. Agapiou</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
