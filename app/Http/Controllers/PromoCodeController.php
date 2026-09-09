<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Http\Requests\PromoCode\StorePromoCodeRequest;
use App\Http\Requests\PromoCode\UpdatePromoCodeRequest;
use App\Http\Resources\PromoCode\PromoCodeResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromoCodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PromoCode::query();

        foreach (["code"] as $field) {
            if ($request->filled($field)) {
                $query->where($field, 'like', '%' . $request->input($field) . '%');
            }
        }

        $promoCodes = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('PromoCodes/PromoCodesIndex', [
            'promoCodes' => PromoCodeResource::collection($promoCodes),
            'filters' => $request->only([
                "code"
            ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('PromoCodes/PromoCodesForm', [
            'promoCode' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePromoCodeRequest $request)
    {
        $validationData = $request->validated();
        $validationData = $this->cleanLimitationsData($validationData);

        PromoCode::create($validationData);

        return redirect()->route('promo-codes.index')->with('success', 'Promo code created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PromoCode $promoCode)
    {
        return Inertia::render('PromoCodes/PromoCodesForm', [
            'promoCode' => new PromoCodeResource($promoCode),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PromoCode $promoCode)
    {
        return Inertia::render('PromoCodes/PromoCodesForm', [
            'promoCode' => new PromoCodeResource($promoCode),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePromoCodeRequest $request, PromoCode $promoCode)
    {
        $validationData = $request->validated();

        $validationData = $this->cleanLimitationsData($validationData);

        $promoCode->update($validationData);

        return redirect()->route('promo-codes.index')->with('success', 'Promo code updated successfully.');
    }

    public function checkPromo(Request $request, $code)
    {

        $promo = PromoCode::where('code', $code)->first();
        if (!$promo) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code not found',
                'promo_code_id' => null,
            ]);
        }
        if ($promo->usage_limit > 0 && $promo->used_count >= $promo->usage_limit) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code limit reached',
                'promo_code_id' => null,
            ]);
        }
        if ($promo->start_date && $promo->start_date > now()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code not active',
                'promo_code_id' => null,
            ]);
        }
        if ($promo->end_date && $promo->end_date < now()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code not active',
                'promo_code_id' => null,
            ]);
        }
        if (!empty($promo->special_user) && $promo->special_user !== $request->user()?->email) {
            return response()->json([
                'status' => 'error',
                'message' => 'This promo code is not valid for your account',
                'promo_code_id' => null,
            ]);
        }
        return response()->json([
            'status' => 'success',
            'message' => 'Promo code is valid',
            'promo_code_id' => $promo->id,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PromoCode $promoCode)
    {
        $promoCode->delete();
        return redirect()->route('promo-codes.index')->with('success', 'Promo code deleted successfully.');
    }


    protected function cleanLimitationsData(array $data)
    {
        // Extract boolean cleanly and avoid undefined array key warning. 
        // Use 'has_limitation' because the React component uses 'has_limitation'.
        $hasLimitation = isset($data['has_limitation']) ? filter_var($data['has_limitation'], FILTER_VALIDATE_BOOLEAN) : false;

        if (!$hasLimitation) {
            $data['max_discount_amount'] = null;
            $data['min_order_amount'] = null;
            $data['usage_limit'] = null;
            $data['special_user'] = null;
            $data['start_date'] = null;
            $data['end_date'] = null;
        }

        return $data;
    }
}
