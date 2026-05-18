import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFormStore } from './useFormStore';
import { SoapShape, SoapScent, SoapColor } from '../../types';
import { MockLocalStorage } from '../test-utils/mock-local-storage';

describe('useFormStore', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    useFormStore.persist.clearStorage();
    useFormStore.setState({
      shape: null,
      scent: null,
      color: null,
      quantity: '',
      size: 75,
      hasLavenderPieces: false,
      currentStep: 'landing',
      visited: false,
    });
  });

  it('has correct default state', () => {
    const state = useFormStore.getState();
    expect(state.shape).toBeNull();
    expect(state.scent).toBeNull();
    expect(state.color).toBeNull();
    expect(state.quantity).toBe('');
    expect(state.size).toBe(75);
    expect(state.hasLavenderPieces).toBe(false);
    expect(state.currentStep).toBe('landing');
    expect(state.visited).toBe(false);
  });

  it('updates individual fields via setField', () => {
    useFormStore.getState().setField('shape', SoapShape.SQUARE);
    expect(useFormStore.getState().shape).toBe(SoapShape.SQUARE);

    useFormStore.getState().setField('scent', SoapScent.LAVENDER);
    expect(useFormStore.getState().scent).toBe(SoapScent.LAVENDER);

    useFormStore.getState().setField('quantity', '5');
    expect(useFormStore.getState().quantity).toBe('5');

    useFormStore.getState().setField('hasLavenderPieces', true);
    expect(useFormStore.getState().hasLavenderPieces).toBe(true);
  });

  it('advances current step', () => {
    useFormStore.getState().setCurrentStep('shape');
    expect(useFormStore.getState().currentStep).toBe('shape');

    useFormStore.getState().setCurrentStep('quantity');
    expect(useFormStore.getState().currentStep).toBe('quantity');
  });

  it('sets visited flag to true', () => {
    expect(useFormStore.getState().visited).toBe(false);
    useFormStore.getState().setVisited();
    expect(useFormStore.getState().visited).toBe(true);
  });

  it('clears all state back to defaults', () => {
    const { setField, setCurrentStep, setVisited, clear } = useFormStore.getState();
    setField('shape', SoapShape.HEART);
    setField('scent', SoapScent.COCONUT);
    setField('color', SoapColor.PINK);
    setField('quantity', '3');
    setField('size', 100);
    setField('hasLavenderPieces', true);
    setCurrentStep('quantity');
    setVisited();

    clear();

    const state = useFormStore.getState();
    expect(state.shape).toBeNull();
    expect(state.scent).toBeNull();
    expect(state.color).toBeNull();
    expect(state.quantity).toBe('');
    expect(state.size).toBe(75);
    expect(state.hasLavenderPieces).toBe(false);
    expect(state.currentStep).toBe('landing');
    expect(state.visited).toBe(false);
  });

  it('persists state to localStorage', () => {
    const { setField, setCurrentStep, setVisited } = useFormStore.getState();
    setField('shape', SoapShape.CIRCLE);
    setField('scent', SoapScent.LEMONGRASS);
    setField('color', SoapColor.BLUE);
    setField('quantity', '10');
    setField('size', 85);
    setField('hasLavenderPieces', true);
    setCurrentStep('quantity');
    setVisited();

    const stored = mockStorage.getItem('soap_form_state');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.shape).toBe(SoapShape.CIRCLE);
    expect(parsed.state.scent).toBe(SoapScent.LEMONGRASS);
    expect(parsed.state.visited).toBe(true);
  });

  it('restores state from localStorage on re-hydrate', async () => {
    // Write persisted data directly to mock storage (simulates previous session)
    const persistedData = {
      state: {
        shape: SoapShape.OVAL_DIP,
        scent: SoapScent.CITRONELLA,
        color: SoapColor.YELLOW,
        quantity: '7',
        size: 60,
        hasLavenderPieces: false,
        currentStep: 'scent',
        visited: true,
      },
      version: 0,
    };
    mockStorage.setItem('soap_form_state', JSON.stringify(persistedData));

    // Re-hydrate the store from localStorage
    useFormStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const state = useFormStore.getState();
    expect(state.shape).toBe(SoapShape.OVAL_DIP);
    expect(state.scent).toBe(SoapScent.CITRONELLA);
    expect(state.visited).toBe(true);
    expect(state.currentStep).toBe('scent');
  });
});
