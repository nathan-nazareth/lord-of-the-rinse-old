import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type SoapScent, type SoapColor, type SoapShape, DEFAULT_SIZE } from "../../types";

type FormStep = "landing" | "shape" | "scent" | "color" | "quantity";

interface FormStore {
  shape: SoapShape | null;
  scent: SoapScent | null;
  color: SoapColor | null;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  currentStep: FormStep;
  hasVisited: boolean;
  setField: <K extends keyof FormStore>(key: K, value: FormStore[K]) => void;
  setFormData: (
    data: Partial<
      Pick<FormStore, "shape" | "scent" | "color" | "quantity" | "size" | "hasLavenderPieces">
    >,
  ) => void;
  resetForm: () => void;
  markVisited: () => void;
}

const INITIAL_FORM_STATE = {
  shape: null as SoapShape | null,
  scent: null as SoapScent | null,
  color: null as SoapColor | null,
  quantity: "",
  size: DEFAULT_SIZE,
  hasLavenderPieces: false,
  currentStep: "landing" as FormStep,
  hasVisited: false,
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...INITIAL_FORM_STATE,

      setField: (key, value) => {
        set({ [key]: value });
      },

      setFormData: (data) => {
        set(data);
      },

      resetForm: () => {
        set(INITIAL_FORM_STATE);
      },

      markVisited: () => {
        set({ hasVisited: true });
      },
    }),
    {
      name: "soap_form_state",
      partialize: (state) => ({
        shape: state.shape,
        scent: state.scent,
        color: state.color,
        quantity: state.quantity,
        size: state.size,
        hasLavenderPieces: state.hasLavenderPieces,
        currentStep: state.currentStep,
        hasVisited: state.hasVisited,
      }),
    },
  ),
);
