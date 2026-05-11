// Guardrail: CATEGORY_SLUGS must stay in lockstep with the Effect Schema
// Literals in @hrbr/registry. If someone adds a category upstream without
// updating the mirror here, this test fails loud.

import { describe, expect, it } from "bun:test";
import { PluginCategory } from "@hrbr/registry";
import { CATEGORY_SLUGS } from "../src/categories";

describe("CATEGORY_SLUGS", () => {
  it("mirrors @hrbr/registry PluginCategory literals", () => {
    // PluginCategory is Schema.Literals(...) — its .literals holds the tuple.
    const literals = new Set((PluginCategory.literals ?? []) as readonly string[]);
    const mirror = new Set(CATEGORY_SLUGS as readonly string[]);
    expect(mirror).toEqual(literals);
  });
});
