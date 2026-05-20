import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SoapColor, SoapScent, SoapShape } from '../../types';

type FormStep = 'landing' | 'shape' | 'scent' | 'color' | 'quantity';

interface FormState {
  shape: SoapShape | null;
  scent: SoapScent | null;
  color: SoapColor | null;
  quantity: string;
  size: number;
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

const DEFAULT_SIZE = 75;

const initialState: FormState = {
  shape: null,
  scent: null,
  color: null,
  quantity: '',
  size: DEFAULT_SIZE,
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
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);
