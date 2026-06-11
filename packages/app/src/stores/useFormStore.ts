import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FormStep = 'landing' | 'shape' | 'scent' | 'color' | 'size' | 'quantity';

const VALID_STEPS: readonly FormStep[] = [
  'landing',
  'shape',
  'scent',
  'color',
  'size',
  'quantity',
] as const;

function isFormStep(value: unknown): value is FormStep {
  return typeof value === 'string' && (VALID_STEPS as readonly string[]).includes(value);
}

export interface FormState {
  shape: string | null;
  scent: string | null;
  color: string | null;
  size: number | null;
  quantity: string;
  hasLavenderPieces: boolean;
  currentStep: FormStep;
  visited: boolean;
}

interface FormActions {
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  setCurrentStep: (step: FormStep) => void;
  setVisited: () => void;
  clear: () => void;
}

const initialState: FormState = {
  shape: null,
  scent: null,
  color: null,
  size: null,
  quantity: '',
  hasLavenderPieces: false,
  currentStep: 'landing',
  visited: false,
};

export const useFormStore = create<FormState & FormActions>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (field, value) => set({ [field]: value }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setVisited: () => set({ visited: true }),
      clear: () => set(initialState),
    }),
    {
      name: 'soap_form_state',
      version: 1,
      storage: {
        getItem: (name) => {
          try {
            const item = localStorage.getItem(name);
            if (!item) return null;
            const parsed: unknown = JSON.parse(item);
            if (
              typeof parsed !== 'object' ||
              parsed === null ||
              typeof (parsed as { state?: unknown }).state !== 'object' ||
              (parsed as { state?: unknown }).state === null
            ) {
              return null;
            }
            const state = (parsed as { state: unknown }).state;
            // Sanitize the persisted `currentStep` so a hand-crafted or
            // older-format localStorage value can't leave the form on
            // a step the UI doesn't know how to render.
            if (typeof state === 'object' && state !== null) {
              const step = (state as { currentStep?: unknown }).currentStep;
              if (!isFormStep(step)) {
                (state as { currentStep: FormStep }).currentStep = 'landing';
              }
            }
            return parsed as { state: unknown; version?: number };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (err) {
            // QuotaExceededError / SecurityError (private mode) — swallow so
            // a misconfigured browser doesn't crash the form. The user's
            // in-progress selection still works for the current session.
            if (import.meta.env.DEV) {
              console.warn('[useFormStore] failed to persist form state', err);
            }
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Ignore — localStorage may be disabled entirely (privacy mode,
            // sandboxed iframe). The store still works for the current
            // session.
          }
        },
      },
    },
  ),
);
