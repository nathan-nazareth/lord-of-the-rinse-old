import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { useFormStore } from './useFormStore';

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
      size: null,
      quantity: '',
      currentStep: 'landing',
      visited: false,
    });
  });

  it('has correct default state', () => {
    const state = useFormStore.getState();
    expect(state.shape).toBeNull();
    expect(state.scent).toBeNull();
    expect(state.color).toBeNull();
    expect(state.size).toBeNull();
    expect(state.quantity).toBe('');
    expect(state.currentStep).toBe('landing');
    expect(state.visited).toBe(false);
  });

  it('updates individual fields via setField', () => {
    useFormStore.getState().setField('shape', 'Square');
    expect(useFormStore.getState().shape).toBe('Square');

    useFormStore.getState().setField('scent', 'Lavender');
    expect(useFormStore.getState().scent).toBe('Lavender');

    useFormStore.getState().setField('quantity', '5');
    expect(useFormStore.getState().quantity).toBe('5');
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
    setField('shape', 'Heart');
    setField('scent', 'Coconut');
    setField('color', 'Pink');
    setField('quantity', '3');
    setField('size', 100);
    setCurrentStep('quantity');
    setVisited();

    clear();

    const state = useFormStore.getState();
    expect(state.shape).toBeNull();
    expect(state.scent).toBeNull();
    expect(state.color).toBeNull();
    expect(state.size).toBeNull();
    expect(state.quantity).toBe('');
    expect(state.currentStep).toBe('landing');
    expect(state.visited).toBe(false);
  });

  it('persists state to localStorage', () => {
    const { setField, setCurrentStep, setVisited } = useFormStore.getState();
    setField('shape', 'Circle');
    setField('scent', 'Lemongrass');
    setField('color', 'Blue');
    setField('quantity', '10');
    setField('size', 75);
    setCurrentStep('quantity');
    setVisited();

    const stored = mockStorage.getItem('soap_form_state');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.shape).toBe('Circle');
    expect(parsed.state.scent).toBe('Lemongrass');
    expect(parsed.state.visited).toBe(true);
  });

  it('restores state from localStorage on re-hydrate', async () => {
    const persistedData = {
      state: {
        shape: 'Oval with Dip',
        scent: 'Citronella',
        color: 'Yellow',
        size: 50,
        quantity: '7',
        currentStep: 'scent',
        visited: true,
      },
      version: 1,
    };
    mockStorage.setItem('soap_form_state', JSON.stringify(persistedData));

    useFormStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const state = useFormStore.getState();
    expect(state.shape).toBe('Oval with Dip');
    expect(state.scent).toBe('Citronella');
    expect(state.visited).toBe(true);
    expect(state.currentStep).toBe('scent');
  });
});
