describe('Vitest setup', () => {
  it('globals are available without imports', () => {
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });

  it('can make assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });
});
