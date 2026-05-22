import { describe, expect, it } from 'vitest';
import {
  orderStatusSchema,
  orderReferenceSchema,
  statusTransitionSchema,
  validTransitions,
} from './order';

describe('orderStatusSchema', () => {
  it('accepts valid statuses', () => {
    for (const status of ['new', 'processing', 'fulfilled', 'cancelled']) {
      expect(orderStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    expect(orderStatusSchema.safeParse('unknown').success).toBe(false);
  });
});

describe('orderReferenceSchema', () => {
  it('accepts valid reference', () => {
    expect(orderReferenceSchema.safeParse('LOR-20260522-0001').success).toBe(true);
  });

  it('rejects malformed reference', () => {
    expect(orderReferenceSchema.safeParse('ORDER-123').success).toBe(false);
    expect(orderReferenceSchema.safeParse('LOR-20260522-001').success).toBe(false);
  });
});

describe('validTransitions', () => {
  it('allows new -> processing', () => {
    expect(validTransitions.new).toContain('processing');
  });

  it('allows new -> cancelled', () => {
    expect(validTransitions.new).toContain('cancelled');
  });

  it('allows processing -> fulfilled', () => {
    expect(validTransitions.processing).toContain('fulfilled');
  });

  it('forbids fulfilled -> anything', () => {
    expect(validTransitions.fulfilled).toHaveLength(0);
  });

  it('forbids cancelled -> anything', () => {
    expect(validTransitions.cancelled).toHaveLength(0);
  });
});

describe('statusTransitionSchema', () => {
  it('accepts valid transition', () => {
    expect(statusTransitionSchema.safeParse({ status: 'processing' }).success).toBe(true);
  });

  it('rejects invalid status', () => {
    expect(statusTransitionSchema.safeParse({ status: 'shipped' }).success).toBe(false);
  });
});
