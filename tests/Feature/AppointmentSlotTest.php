<?php

namespace Tests\Feature;

use App\Enum\DayOfWeek;
use App\Models\Holiday;
use App\Models\Order;
use App\Models\OrderAppointment;
use App\Models\OrderItem;
use App\Models\Package;
use App\Models\Store;
use App\Models\StoreHour;
use App\Models\StorePackageCapacity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AppointmentSlotTest extends TestCase
{
    use RefreshDatabase;

    private string $apiKey = 'test-bearer-token';
    private Store $store;
    private Package $package;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.public_api.key' => $this->apiKey]);

        // Create a test store
        $this->store = Store::create([
            'name' => 'Nicosia Test Store',
            'slug' => 'nicosia-test-store',
            'description' => 'Test Store Description',
            'address' => 'Nicosia, Cyprus',
            'is_active' => true,
        ]);

        // Create a test package
        $this->package = Package::create([
            'name' => 'Blood Test Package',
            'path' => 'blood-test-package',
            'price' => 50.00,
            'duration' => 30, // 30 minutes
        ]);
    }

    private function getWithAuth(string $uri, array $headers = [])
    {
        return $this->get($uri, array_merge([
            'Authorization' => "Bearer {$this->apiKey}"
        ], $headers));
    }

    public function test_fails_without_authentication(): void
    {
        $response = $this->getJson('/api/public/appointments/slots');
        $response->assertStatus(401);
    }

    public function test_validation_errors(): void
    {
        $response = $this->getWithAuth('/api/public/appointments/slots');
        $response->assertStatus(302); // Standard validation redirects or gets 422 if JSON is requested.

        $responseJson = $this->getJson('/api/public/appointments/slots', [
            'Authorization' => "Bearer {$this->apiKey}"
        ]);
        $responseJson->assertStatus(422)
            ->assertJsonValidationErrors(['store_id', 'package_id', 'date']);
    }

    public function test_returns_empty_slots_if_store_is_closed_on_weekday(): void
    {
        // Monday, June 15th, 2026
        $date = '2026-06-15';

        // Configure store hours: Closed on Monday
        StoreHour::create([
            'store_id' => $this->store->id,
            'day_of_week' => DayOfWeek::Monday,
            'is_closed' => true,
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $response = $this->getJson("/api/public/appointments/slots?store_id={$this->store->id}&package_id={$this->package->id}&date={$date}", [
            'Authorization' => "Bearer {$this->apiKey}"
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'slots' => []
            ]);
    }

    public function test_returns_slots_if_store_is_open_on_weekday(): void
    {
        // Monday, June 15th, 2026
        $date = '2026-06-15';

        // Configure store hours: Open 08:00 to 10:00 (two hours)
        StoreHour::create([
            'store_id' => $this->store->id,
            'day_of_week' => DayOfWeek::Monday,
            'is_closed' => false,
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
        ]);

        $response = $this->getJson("/api/public/appointments/slots?store_id={$this->store->id}&package_id={$this->package->id}&date={$date}", [
            'Authorization' => "Bearer {$this->apiKey}"
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $slots = $response->json('slots');
        // Slots should be:
        // 08:00 - 08:30 (available)
        // 08:30 - 09:00 (available)
        // 09:00 - 09:30 (available)
        // 09:30 - 10:00 (available)
        $this->assertCount(4, $slots);
        $this->assertEquals('08:00', $slots[0]['start_time']);
        $this->assertEquals('08:30', $slots[0]['end_time']);
        $this->assertTrue($slots[0]['available']);
    }

    public function test_returns_empty_slots_on_closed_holiday(): void
    {
        // Monday, June 15th, 2026
        $date = '2026-06-15';

        // Open on Monday regularly
        StoreHour::create([
            'store_id' => $this->store->id,
            'day_of_week' => DayOfWeek::Monday,
            'is_closed' => false,
            'start_time' => '08:00',
            'end_time' => '17:00',
        ]);

        // Holiday on Monday: Closed
        Holiday::create([
            'store_id' => $this->store->id,
            'start_date' => $date,
            'end_date' => $date,
            'name' => 'Summer Holiday',
            'is_closed' => true,
        ]);

        $response = $this->getJson("/api/public/appointments/slots?store_id={$this->store->id}&package_id={$this->package->id}&date={$date}", [
            'Authorization' => "Bearer {$this->apiKey}"
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'slots' => []
            ]);
    }

    public function test_overrides_hours_on_special_hours_holiday(): void
    {
        // Monday, June 15th, 2026
        $date = '2026-06-15';

        // Open regularly 08:00 to 17:00
        StoreHour::create([
            'store_id' => $this->store->id,
            'day_of_week' => DayOfWeek::Monday,
            'is_closed' => false,
            'start_time' => '08:00',
            'end_time' => '17:00',
        ]);

        // Holiday on Monday: Special hours 09:00 to 10:00
        Holiday::create([
            'store_id' => $this->store->id,
            'start_date' => $date,
            'end_date' => $date,
            'name' => 'Short Holiday Day',
            'is_closed' => false,
            'open_time' => '09:00:00',
            'close_time' => '10:00:00',
        ]);

        dump(Holiday::all()->toArray());

        $response = $this->getJson("/api/public/appointments/slots?store_id={$this->store->id}&package_id={$this->package->id}&date={$date}", [
            'Authorization' => "Bearer {$this->apiKey}"
        ]);

        $response->assertStatus(200);
        dd($response->json());
        $slots = $response->json('slots');
        // Slots should be:
        // 09:00 - 09:30
        // 09:30 - 10:00
        $this->assertCount(2, $slots);
        $this->assertEquals('09:00', $slots[0]['start_time']);
        $this->assertEquals('09:30', $slots[0]['end_time']);
    }

    public function test_checks_capacity_and_marks_slots_unavailable(): void
    {
        // Monday, June 15th, 2026
        $date = '2026-06-15';

        // Open 08:00 to 10:00
        StoreHour::create([
            'store_id' => $this->store->id,
            'day_of_week' => DayOfWeek::Monday,
            'is_closed' => false,
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        // Capacity: 2 concurrent bookings
        StorePackageCapacity::create([
            'store_id' => $this->store->id,
            'package_id' => $this->package->id,
            'max_concurrent_bookings' => 2,
        ]);

        // Create dummy order
        $order = Order::create([
            'client_id' => 1,
            'amount' => 50,
            'discount_amount' => 0,
            'total_amount' => 50,
            'status' => 'pending',
        ]);

        // Create Order Items
        $orderItem1 = OrderItem::create([
            'order_id' => $order->id,
            'package_id' => $this->package->id,
            'package_name' => $this->package->name,
            'price' => $this->package->price,
            'quantity' => 1,
            'total_price' => $this->package->price,
        ]);

        $orderItem2 = OrderItem::create([
            'order_id' => $order->id,
            'package_id' => $this->package->id,
            'package_name' => $this->package->name,
            'price' => $this->package->price,
            'quantity' => 1,
            'total_price' => $this->package->price,
        ]);

        // Booking 1: 08:00 to 08:30
        OrderAppointment::create([
            'order_item_id' => $orderItem1->id,
            'store_id' => $this->store->id,
            'date' => $date,
            'start_time' => '08:00:00',
            'end_time' => '08:30:00',
            'duration' => 30,
            'status' => 'confirmed',
        ]);

        // Booking 2: 08:15 to 08:45 (this overlaps with 08:00-08:30 AND 08:30-09:00)
        OrderAppointment::create([
            'order_item_id' => $orderItem2->id,
            'store_id' => $this->store->id,
            'date' => $date,
            'start_time' => '08:15:00',
            'end_time' => '08:45:00',
            'duration' => 30,
            'status' => 'confirmed',
        ]);

        // Let's check:
        // Slot 1: 08:00 - 08:30. Overlaps with booking 1 (08:00-08:30) and booking 2 (08:15-08:45). Total overlaps = 2. Capacity is 2. So unavailable!
        // Slot 2: 08:30 - 09:00. Overlaps with booking 2 (08:15-08:45). Total overlaps = 1. Capacity is 2. So available!

        $response = $this->getJson("/api/public/appointments/slots?store_id={$this->store->id}&package_id={$this->package->id}&date={$date}", [
            'Authorization' => "Bearer {$this->apiKey}"
        ]);

        $response->assertStatus(200);
        $slots = $response->json('slots');

        $this->assertFalse($slots[0]['available'], 'Slot 08:00-08:30 should be unavailable');
        $this->assertTrue($slots[1]['available'], 'Slot 08:30-09:00 should be available');
    }

    public function test_marks_past_slots_unavailable_for_today(): void
    {
        // Force the "current time" to be 12:00 PM on a specific date
        $fixedNow = Carbon::parse('2026-06-15 12:00:00');
        Carbon::setTestNow($fixedNow);

        $date = '2026-06-15'; // Booking for today

        // Store open from 09:00 to 15:00
        StoreHour::create([
            'store_id' => $this->store->id,
            'day_of_week' => DayOfWeek::Monday,
            'is_closed' => false,
            'start_time' => '09:00',
            'end_time' => '15:00',
        ]);

        $response = $this->getJson("/api/public/appointments/slots?store_id={$this->store->id}&package_id={$this->package->id}&date={$date}", [
            'Authorization' => "Bearer {$this->apiKey}"
        ]);

        $response->assertStatus(200);
        $slots = $response->json('slots');

        // Since it's currently 12:00:
        // Slot 09:00 - 09:30 should be unavailable (in the past)
        // Slot 11:30 - 12:00 should be unavailable (in the past/current)
        // Slot 12:00 - 12:30 should be available (starts in future)
        // Slot 12:30 - 13:00 should be available (in future)
        
        foreach ($slots as $slot) {
            if ($slot['start_time'] < '12:00') {
                $this->assertFalse($slot['available'], "Slot starting at {$slot['start_time']} should be unavailable as it is in the past.");
            } else {
                $this->assertTrue($slot['available'], "Slot starting at {$slot['start_time']} should be available as it is in the future.");
            }
        }

        Carbon::setTestNow(); // Clean up test now
    }
}
