import { expect, test } from "vitest";

// Why money is kept in integer cents (exercise 4).
test("floats do not add up", () => {
  expect(0.1 + 0.2).not.toBe(0.3);
  expect(10 + 20).toBe(30); // cents do
});
