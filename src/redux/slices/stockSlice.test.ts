import { expect, test } from 'vitest';
import pricesReducer, { snapshotReceived, ticksReceived } from './stockSlice';

test('starts empty', () => {
  expect(pricesReducer(undefined, { type: '@@init' })).toEqual({});
});

test('snapshot replaces all prices, dropping symbols it does not mention', () => {
  const before = { LHV1T: 300, OLD: 100 };
  expect(pricesReducer(before, snapshotReceived({ LHV1T: 312, AAPL: 22841 }))).toEqual({
    LHV1T: 312,
    AAPL: 22841,
  });
});

test('ticks merge into existing prices without mutating the old state', () => {
  const before = { LHV1T: 312, AAPL: 22841 };
  const after = pricesReducer(before, ticksReceived({ AAPL: 22900, NOKIA: 452 }));
  expect(after).toEqual({ LHV1T: 312, AAPL: 22900, NOKIA: 452 });
  expect(before).toEqual({ LHV1T: 312, AAPL: 22841 });
  expect(after).not.toBe(before);
});
