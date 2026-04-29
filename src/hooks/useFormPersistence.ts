import { useState, useEffect, useRef, useCallback } from "react";
import { SoapScent, SoapColor, SoapShape } from "../../types";

type FormStep = "landing" | "shape" | "scent" | "color" | "quantity";

interface SavedFormState {
  shape: string | null;
  scent: string | null;
  color: string | null;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  currentStep: FormStep;
}

const FORM_STATE_KEY = "soap_form_state";
const VISITED_KEY = "soap_visited";
const SAVE_DEBOUNCE_MS = 500;

function isHardRefresh(): boolean {
  try {
    if (performance.navigation) {
      return performance.navigation.type === 1;
    }
    const entries = performance.getEntriesByType("navigation") as PerformanceNavigation[];
    if (entries.length > 0) {
      return entries[0].type === "reload";
    }
  } catch {
    // Fallback for older browsers
  }
  return false;
}

export function useFormPersistence() {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [wasHardRefresh, setWasHardRefresh] = useState<boolean | null>(null);

  useEffect(() => {
    setWasHardRefresh(isHardRefresh());
  }, []);

  const hasVisited = useCallback(() => {
    if (wasHardRefresh === true) return false;
    try {
      return localStorage.getItem(VISITED_KEY) !== null;
    } catch {
      return false;
    }
  }, [wasHardRefresh]);

  const restoreFormState = useCallback((): Partial<{
    shape: SoapShape;
    scent: SoapScent;
    color: SoapColor;
    quantity: string;
    size: number;
    hasLavenderPieces: boolean;
    currentStep: FormStep;
  }> | null => {
    try {
      const saved = localStorage.getItem(FORM_STATE_KEY);
      if (!saved) return null;
      const parsed: SavedFormState = JSON.parse(saved);
      return {
        shape: parsed.shape as SoapShape,
        scent: parsed.scent as SoapScent,
        color: parsed.color as SoapColor,
        quantity: parsed.quantity,
        size: parsed.size,
        hasLavenderPieces: parsed.hasLavenderPieces,
        currentStep: parsed.currentStep,
      };
    } catch {
      return null;
    }
  }, []);

  const saveFormState = useCallback((
    shape: SoapShape | null,
    scent: SoapScent | null,
    color: SoapColor | null,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
    currentStep: FormStep,
  ) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const stateToSave: SavedFormState = {
          shape, scent, color, quantity, size,
          hasLavenderPieces, currentStep,
        };
        localStorage.setItem(FORM_STATE_KEY, JSON.stringify(stateToSave));
        localStorage.setItem(VISITED_KEY, "true");
      } catch {
        // Incognito or quota exceeded
      }
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const clearFormState = useCallback(() => {
    clearTimeout(saveTimerRef.current);
    try {
      localStorage.removeItem(FORM_STATE_KEY);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  return { hasVisited, restoreFormState, saveFormState, clearFormState };
}
