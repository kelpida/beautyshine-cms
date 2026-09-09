#!/bin/bash
# Clear all Laravel cache on production server

php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo "✅ All caches cleared successfully"
