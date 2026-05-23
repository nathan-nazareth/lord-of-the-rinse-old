import { createCartItem } from './cart-item-factory';
import { MockLocalStorage } from './mock-local-storage';

describe('MockLocalStorage', () => {
  let storage: MockLocalStorage;

  beforeEach(() => {
    storage = new MockLocalStorage();
  });

  it('round-trips setItem and getItem', () => {
    storage.setItem('key', 'value');
    expect(storage.getItem('key')).toBe('value');
  });

  it('returns null for missing keys', () => {
    expect(storage.getItem('missing')).toBeNull();
  });

  it('removes items with removeItem', () => {
    storage.setItem('key', 'value');
    storage.removeItem('key');
    expect(storage.getItem('key')).toBeNull();
  });

  it('clears all items', () => {
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    storage.clear();
    expect(storage.getItem('a')).toBeNull();
    expect(storage.getItem('b')).toBeNull();
  });

  it('tracks length correctly', () => {
    expect(storage.length).toBe(0);
    storage.setItem('a', '1');
    expect(storage.length).toBe(1);
    storage.setItem('b', '2');
    expect(storage.length).toBe(2);
    storage.removeItem('a');
    expect(storage.length).toBe(1);
  });

  it('returns key at index', () => {
    storage.setItem('first', '1');
    storage.setItem('second', '2');
    const keys = [storage.key(0), storage.key(1)].sort();
    expect(keys).toEqual(['first', 'second']);
  });

  it('returns null for out-of-bounds key index', () => {
    storage.setItem('only', 'value');
    expect(storage.key(5)).toBeNull();
  });
});

describe('createCartItem', () => {
  it('returns an item with correct default values', () => {
    const item = createCartItem();

    expect(item.shape).toBe('rectangle');
    expect(item.scent).toBe('unscented');
    expect(item.price).toBe(8.99);
    expect(item.color).toBe('white');
    expect(item.quantity).toBe(1);
    expect(item.size).toBe('100g');
    expect(item.variantId).toBe('variant-1');
    expect(typeof item.id).toBe('string');
    expect(item.id.length).toBeGreaterThan(0);
    expect(typeof item.addedAt).toBe('string');
    expect(() => new Date(item.addedAt)).not.toThrow();
  });

  it('overrides defaults with provided values', () => {
    const item = createCartItem({ price: 12.5, scent: 'lavender', quantity: 3 });

    expect(item.price).toBe(12.5);
    expect(item.scent).toBe('lavender');
    expect(item.quantity).toBe(3);
    expect(item.shape).toBe('rectangle');
    expect(item.color).toBe('white');
  });
});
