import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { useFormStore } from '../stores/useFormStore';
import { SoapForm } from './SoapForm';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { SoapShape, SoapScent, SoapColor } from '../../types';

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
    expect(screen.getByText('Begin Creating')).toBeTruthy(); // Landing page button
    expect(screen.getByText('Lord of the Rinse')).toBeTruthy(); // Title
  });

  it('transitions from landing to shape step when Begin Creating is clicked', async () => {
    render(<SoapForm cart={{ items: [], totalQuantity: 0 }} onAddToCart={() => {}} onGoToCart={() => {}} onGoToCheckout={() => {}} />);

    // Initially on landing page
    expect(screen.getByText('Begin Creating')).toBeTruthy();

    // Click "Begin Creating"
    const beginButton = screen.getByText('Begin Creating');
    beginButton.click();

    // Should transition to shape step
    await waitFor(() => {
      expect(screen.getByText('Select your shape')).toBeTruthy();
    });
    expect(useFormStore.getState().visited).toBe(true);
  });

  it('updates shape in store when a shape is selected', async () => {
    // Start on shape step
    useFormStore.getState().setCurrentStep('shape');
    useFormStore.getState().setVisited();

    render(<SoapForm cart={{ items: [], totalQuantity: 0 }} onAddToCart={() => {}} onGoToCart={() => {}} onGoToCheckout={() => {}} />);

    // Click on first shape option (Square)
    const shapeButtons = screen.getAllByRole('button', { pressed: false });
    shapeButtons[0].click();

    // Verify shape is set in store
    await waitFor(() => {
      expect(useFormStore.getState().shape).toBe(SoapShape.SQUARE);
    });
  });

  it('clears form store after adding to cart', async () => {
    // Set up form state
    useFormStore.getState().setField('shape', SoapShape.SQUARE);
    useFormStore.getState().setField('scent', SoapScent.LAVENDER);
    useFormStore.getState().setField('color', SoapColor.WHITE);
    useFormStore.getState().setField('quantity', '2');
    useFormStore.getState().setField('size', 75);
    useFormStore.getState().setCurrentStep('quantity');

    const mockAddToCart = vi.fn();
    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={mockAddToCart}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />
    );

    // Click Add to Cart
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    addToCartButton.click();

    // Verify store is cleared
    await waitFor(() => {
      const state = useFormStore.getState();
      expect(state.shape).toBeNull();
      expect(state.scent).toBeNull();
      expect(state.quantity).toBe('');
    });
    expect(mockAddToCart).toHaveBeenCalled();
  });
});