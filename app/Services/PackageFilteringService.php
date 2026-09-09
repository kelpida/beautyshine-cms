<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class PackageFilteringService
{
    public function filtering($query, $request)
    {
        /* =========================
       | PACKAGE DIRECT FILTERS
       ========================= */
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('category')) {
            $categories = is_array($request->category)
                ? $request->category
                : explode(',', $request->category);

            $query->whereIn('category', $categories);
        }

        if ($request->filled('age_group')) {
            $ageGroups = is_array($request->age_group)
                ? $request->age_group
                : explode(',', $request->age_group);

            $query->whereIn('age_group', $ageGroups);
        }

        if ($request->filled('price_from')) {
            $query->where('price', '>=', $request->price_from);
        }

        if ($request->filled('price_to')) {
            $query->where('price', '<=', $request->price_to);
        }

        if ($request->filled('number')) {
            $query->where('number', $request->number);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%");
            });
        }

        /* =========================
        | ATTRIBUTE FILTERS
        ========================= */

        // You can add custom attribute filtering here if needed
        // Similar to the original PropertyFilteringService
        // but tailored to healthcare package attributes

        /* =========================
        | SORT
        ========================= */

        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        $sortableColumns = [
            'price' => 'price',
            'name' => 'name',
            'number' => 'number',
        ];

        $sortColumn = $sortableColumns[$sort] ?? 'created_at';

        $query->orderBy($sortColumn, $order);

        return $query;
    }
}
