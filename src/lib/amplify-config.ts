"use client";

import { Amplify } from "aws-amplify";

let configured: boolean | null = null;
let configuringPromise: Promise<boolean> | null = null;

export const ensureAmplify = async (): Promise<boolean> => {
    if (configured !== null) return configured;
    if (configuringPromise) return configuringPromise;

    configuringPromise = (async () => {
        try {
            const res = await fetch("/amplify_outputs.json", {
                cache: "no-store",
            });
            if (!res.ok) {
                configured = false;
                return false;
            }
            const outputs = await res.json();
            Amplify.configure(outputs);
            configured = true;
            return true;
        } catch {
            configured = false;
            return false;
        } finally {
            configuringPromise = null;
        }
    })();

    return configuringPromise;
};

export const isAmplifyConfigured = () => configured === true;
