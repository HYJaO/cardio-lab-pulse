import { expect, test } from "bun:test";
import { getMurmur, LAB_MURMURS, MURMURS } from "./murmurs";

test("every murmur selection resolves to its own complete model", () => {
  expect(LAB_MURMURS).toHaveLength(8);
  for (const murmur of MURMURS) {
    expect(getMurmur(murmur.id)).toBe(murmur);
    expect(Number.isFinite(getMurmur(murmur.id).envelope(0.25))).toBe(true);
  }
});

test("an invalid selection safely resolves to the normal reference", () => {
  expect(getMurmur("invalid-selection").id).toBe("normal");
  expect(getMurmur("invalid-selection").envelope(0.25)).toBe(0);
});