import assert from "node:assert/strict";
import test from "node:test";
import { isValidIssueCoordinatePair } from "./issueCoordinates.js";

test("issue coordinates may both be omitted or null", () => {
  assert.equal(isValidIssueCoordinatePair(undefined, undefined), true);
  assert.equal(isValidIssueCoordinatePair(null, null), true);
});

test("issue coordinates require a complete numeric pair", () => {
  assert.equal(isValidIssueCoordinatePair(1, undefined), false);
  assert.equal(isValidIssueCoordinatePair(undefined, 1), false);
  assert.equal(isValidIssueCoordinatePair(null, 1), false);
  assert.equal(isValidIssueCoordinatePair("1", "2"), false);
});

test("issue coordinate pair accepts valid geographic boundaries", () => {
  assert.equal(isValidIssueCoordinatePair(-90, -180), true);
  assert.equal(isValidIssueCoordinatePair(90, 180), true);
  assert.equal(isValidIssueCoordinatePair(45.5, -120.25), true);
});

test("issue coordinate pair rejects non-finite and out-of-range values", () => {
  assert.equal(isValidIssueCoordinatePair(Number.NaN, 0), false);
  assert.equal(isValidIssueCoordinatePair(Number.POSITIVE_INFINITY, 0), false);
  assert.equal(isValidIssueCoordinatePair(-90.01, 0), false);
  assert.equal(isValidIssueCoordinatePair(0, 180.01), false);
});
