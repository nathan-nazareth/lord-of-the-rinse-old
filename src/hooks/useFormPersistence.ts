import { useState, useEffect, useRef, useCallback } from "react";
import { SoapScent, SoapColor } from "../../types";

type FormStep = "landing" | "scent" | "color" | "quantity";

interface SavedFormState {
  scent: string | null;
  color: string | null;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  hasRosePieces: boolean;
  currentStep: FormStep;
}

const FORM_STATE_KEY = "soap_form_state";
const VISITED_KEY = "soap_visited";
const SAVE_DEBOUNCE_MS = 500;

export function useFormPersistence() {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const hasVisited = useCallback(() => {
    try {
      return localStorage.getItem(VISITED_KEY) !== null;
    } catch {
      return false;
    }
  }, []);

  const restoreFormState = useCallback((): Partial<{
    scent: SoapScent;
    color: SoapColor;
    quantity: string;
    size: number;
    hasLavenderPieces: boolean;
    hasRosePieces: boolean;
    currentStep: FormStep;
  }> | null => {
    try {
      const saved = localStorage.getItem(FORM_STATE_KEY);
      if (!saved) return null;
      const parsed: SavedFormState = JSON.parse(saved);
      return {
        scent: parsed.scent as SoapScent,
        color: parsed.color as SoapColor,
        quantity: parsed.quantity,
        size: parsed.size,
        hasLavenderPieces: parsed.hasLavenderPieces,
        hasRosePieces: parsed.hasRosePieces ?? false,
        currentStep: parsed.currentStep,
      };
    } catch {
      return null;
    }
  }, []);

  const saveFormState = useCallback((
    scent: SoapScent | null,
    color: SoapColor | null,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
    hasRosePieces: boolean,
    currentStep: FormStep,
  ) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const stateToSave: SavedFormState = {
          scent, color, quantity, size,
          hasLavenderPieces, hasRosePieces, currentStep,
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
