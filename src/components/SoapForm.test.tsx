import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { useFormStore } from '../stores/useFormStore';
import { SoapForm } from './SoapForm';
import { MockLocalStorage } from '../test-utils/mock-local-storage';

describe('SoapForm component', () => {
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

  it('renders initial state correctly', () => {
    render(<SoapForm cart={{ items: [], totalQuantity: 0 }} onAddToCart={() => {}} onGoToCart={() => {}} onGoToCheckout={() => {}} />);

    // Check that initial form state renders correctly from the store
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument(); // Landing step
    expect(screen.getByText('Lord of the Rinse')).toBeInTheDocument(); // Title
  });
});