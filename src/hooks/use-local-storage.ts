"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
    // Always start with initialValue so SSR/SSG output matches the first
    // client render. Real localStorage value is loaded after mount.
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [loaded, setLoaded] = useState(false);
    const initialRef = useRef(initialValue);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue({
                    ...initialRef.current,
                    ...JSON.parse(item),
                } as T);
            }
        } catch (error) {
            console.error(error);
        }
        setLoaded(true);
    }, [key]);

    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            setStoredValue((prev) => {
                const next = value instanceof Function ? value(prev) : value;
                try {
                    window.localStorage.setItem(key, JSON.stringify(next));
                } catch (error) {
                    console.error(error);
                }
                return next;
            });
        },
        [key],
    );

    return [storedValue, setValue, loaded] as const;
};
