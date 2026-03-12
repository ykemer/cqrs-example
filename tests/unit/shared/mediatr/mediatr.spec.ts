describe('mediatr resolver (tsyringe integration)', () => {
  it('resolver.add registers and resolve returns instance', () => {
    jest.isolateModules(() => {
      const {mediatR} = require('../../../../src/shared/mediatr/mediatr');
      // Try to find the resolver object on mediatR (implementation detail may vary)
      const candidates: Array<{add: (t: unknown) => void; resolve: (t: unknown) => unknown}> = [];
      for (const key of Object.getOwnPropertyNames(mediatR)) {
        const val = (mediatR as unknown as Record<string, unknown>)[key];
        if (val && typeof (val as any).add === 'function' && typeof (val as any).resolve === 'function') {
          candidates.push(val as unknown as {add: (t: unknown) => void; resolve: (t: unknown) => unknown});
        }
      }
      // Also check prototype
      const proto = Object.getPrototypeOf(mediatR) || {};
      for (const key of Object.getOwnPropertyNames(proto)) {
        const val = (mediatR as unknown as Record<string, unknown>)[key];
        if (val && typeof (val as any).add === 'function' && typeof (val as any).resolve === 'function')
          candidates.push(val as unknown as {add: (t: unknown) => void; resolve: (t: unknown) => unknown});
      }

      const resolver = candidates[0];
      expect(resolver).toBeDefined();
      class Dummy {}
      resolver.add(Dummy);
      const instance = resolver.resolve(Dummy);
      expect(instance).toBeInstanceOf(Dummy);
    });
  });
});
