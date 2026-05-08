"use client";

import { useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Initial theme detection
    const updateTheme = () => {
      const dataTheme = document.documentElement.getAttribute("data-theme");
      // Dark themes in DaisyUI: dark, dim, material-dark
      const isDark = dataTheme === "dark" || dataTheme === "dim" || dataTheme === "material-dark";
      setTheme(isDark ? "dark" : "light");
    };

    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return <SonnerToaster position="top-right" richColors theme={theme} closeButton />;
}

