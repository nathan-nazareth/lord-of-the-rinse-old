import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormStore } from '../stores/useFormStore';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { SoapForm } from './SoapForm';

// Mock useCatalog hook
vi.mock('../hooks/useCatalog', () => ({
  useCatalog: vi.fn(),
}));

import { useCatalog } from '../hooks/useCatalog';

const MOCK_CATALOG = {
  attributes: {
    shape: [
      { id: 'shape-1', name: 'Square', slug: 'square', type: 'shape', displayOrder: 0 },
      { id: 'shape-2', name: 'Circle', slug: 'circle', type: 'shape', displayOrder: 1 },
    ],
    scent: [
      { id: 'scent-1', name: 'Lavender', slug: 'lavender', type: 'scent', displayOrder: 0 },
      { id: 'scent-2', name: 'Coconut', slug: 'coconut', type: 'scent', displayOrder: 1 },
    ],
    color: [
      { id: 'color-1', name: 'White', slug: '#FFFFFF', type: 'color', displayOrder: 0 },
      { id: 'color-2', name: 'Pink', slug: '#FCD5CE', type: 'color', displayOrder: 1 },
    ],
    size: [
      { id: 'size-1', name: '50g', slug: '50g', type: 'size', displayOrder: 0 },
      { id: 'size-2', name: '75g', slug: '75g', type: 'size', displayOrder: 1 },
    ],
  },
  variants: [
    {
      id: 'variant-1',
      name: 'Square Lavender White 50g',
      slug: 'square-lavender-white-50g',
      unitPrice: '110',
      enabled: true,
      attributes: [
        { attributeId: 'shape-1', value: 'Square' },
        { attributeId: 'scent-1', value: 'Lavender' },
        { attributeId: 'color-1', value: 'White' },
        { attributeId: 'size-1', value: '50g' },
      ],
    },
    {
      id: 'variant-2',
      name: 'Circle Coconut Pink 75g',
      slug: 'circle-coconut-pink-75g',
      unitPrice: '100',
      enabled: true,
      attributes: [
        { attributeId: 'shape-2', value: 'Circle' },
        { attributeId: 'scent-2', value: 'Coconut' },
        { attributeId: 'color-2', value: 'Pink' },
        { attributeId: 'size-2', value: '75g' },
      ],
    },
  ],
  settings: { shop_open: 'true', currency: 'USD', discount_tiers: '[{"minItems":2,"percent":10}]' },
};

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
      size: null,
      quantity: '',
      currentStep: 'landing',
      visited: false,
    });
    vi.mocked(useCatalog).mockReturnValue({
      data: MOCK_CATALOG,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useCatalog>);
  });

  it('renders initial state correctly', () => {
    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={() => {}}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />,
    );

    expect(screen.getByText('Begin Creating')).toBeTruthy();
    expect(screen.getByText('Lord of the Rinse')).toBeTruthy();
  });

  it('transitions from landing to shape step when Begin Creating is clicked', async () => {
    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={() => {}}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />,
    );

    expect(screen.getByText('Begin Creating')).toBeTruthy();

    const beginButton = screen.getByText('Begin Creating');
    beginButton.click();

    await waitFor(() => {
      expect(screen.getByText('Select your shape')).toBeTruthy();
    });
    expect(useFormStore.getState().visited).toBe(true);
  });

  it('renders shape options from catalog', async () => {
    useFormStore.getState().setCurrentStep('shape');
    useFormStore.getState().setVisited();

    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={() => {}}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />,
    );

    expect(screen.getByText('Square')).toBeTruthy();
    expect(screen.getByText('Circle')).toBeTruthy();
  });

  it('updates shape in store when a shape is selected', async () => {
    useFormStore.getState().setCurrentStep('shape');
    useFormStore.getState().setVisited();

    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={() => {}}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />,
    );

    // Click on Square shape
    const squareButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.includes('Square'));
    squareButton?.click();

    await waitFor(() => {
      expect(useFormStore.getState().shape).toBe('Square');
    });
  });

  it('shows shop closed message when shop_open is false', () => {
    vi.mocked(useCatalog).mockReturnValue({
      data: { ...MOCK_CATALOG, settings: { ...MOCK_CATALOG.settings, shop_open: 'false' } },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useCatalog>);

    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={() => {}}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />,
    );

    expect(screen.getByText('Our shop is currently closed')).toBeTruthy();
  });

  it('shows loading state while catalog loads', () => {
    vi.mocked(useCatalog).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useCatalog>);

    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={() => {}}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />,
    );

    expect(screen.getByText('Loading our collection...')).toBeTruthy();
  });

  it('clears form store after adding to cart', async () => {
    useFormStore.getState().setField('shape', 'Square');
    useFormStore.getState().setField('scent', 'Lavender');
    useFormStore.getState().setField('color', 'White');
    useFormStore.getState().setField('size', '50g');
    useFormStore.getState().setField('quantity', '2');
    useFormStore.getState().setCurrentStep('quantity');

    const mockAddToCart = vi.fn();
    render(
      <SoapForm
        cart={{ items: [], totalQuantity: 0 }}
        onAddToCart={mockAddToCart}
        onGoToCart={() => {}}
        onGoToCheckout={() => {}}
      />,
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    addToCartButton.click();

    await waitFor(() => {
      const state = useFormStore.getState();
      expect(state.shape).toBeNull();
      expect(state.scent).toBeNull();
      expect(state.quantity).toBe('');
    });
    expect(mockAddToCart).toHaveBeenCalledWith(
      'variant-1',
      'Square',
      'Lavender',
      110,
      'White',
      '2',
      '50g',
    );
  });
});
