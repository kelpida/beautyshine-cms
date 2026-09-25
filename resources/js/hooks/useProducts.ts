import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export interface UseProductsParams {
    page?: number;
    perPage?: number;
    q?: string;
    initialData?: any;
}

export function useProducts({
    page: initialPage = 1,
    perPage: initialPerPage = 12,
    q: initialQ = "",
    initialData,
}: UseProductsParams = {}) {
    const [page, setPage] = useState<number>(initialPage);
    const [perPage, setPerPage] = useState<number>(initialPerPage);
    const [q, setQ] = useState<string>(initialQ);
    const [data, setData] = useState<any[]>(() => {
        if (!initialData) return [];
        if (Array.isArray(initialData.data)) return initialData.data;
        if (Array.isArray(initialData)) return initialData;
        return [];
    });
    const [pagination, setPagination] = useState(() => {
        if (initialData?.total !== undefined) {
            return {
                current_page: initialData.current_page || 1,
                per_page: initialData.per_page || initialPerPage,
                total: initialData.total || 0,
                last_page: initialData.last_page || 1,
            };
        }
        return {
            current_page: 1,
            per_page: initialPerPage,
            total: 0,
            last_page: 1,
        };
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const debounceTimerRef = useRef<any>(null);

    const fetchProducts = useCallback(
        async (searchQuery = q, currentPage = page, currentPerPage = perPage) => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await axios.get(route("products.order-items"), {
                    params: {
                        q: searchQuery,
                        page: currentPage,
                        per_page: currentPerPage,
                    },
                });

                const resData = response.data;
                // resData is a Laravel LengthAwarePaginator
                if (resData && Array.isArray(resData.data)) {
                    setData(resData.data);
                    setPagination({
                        current_page: resData.current_page || 1,
                        per_page: resData.per_page || currentPerPage,
                        total: resData.total || 0,
                        last_page: resData.last_page || 1,
                    });
                } else if (Array.isArray(resData)) {
                    setData(resData);
                    setPagination({
                        current_page: 1,
                        per_page: resData.length,
                        total: resData.length,
                        last_page: 1,
                    });
                }
            } catch (err: any) {
                setError(err);
                console.error("Error fetching order products:", err);
            } finally {
                setIsLoading(false);
            }
        },
        [q, page, perPage]
    );

    const handleSetQ = useCallback((newQ: string) => {
        setQ(newQ);
        setPage(1);
    }, []);

    // Fetch on q, page, or perPage change (UI debounces typing input)
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchProducts(q, page, perPage);
        }, 50);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [q, page, perPage]);

    return {
        data,
        products: data,
        isLoading,
        error,
        page,
        perPage,
        q,
        pagination,
        setPage,
        setPerPage,
        setQ: handleSetQ,
        refetch: () => fetchProducts(q, page, perPage),
    };
}
