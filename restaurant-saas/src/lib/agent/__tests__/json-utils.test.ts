import { describe, it, expect } from "vitest";
import { safeParseLLMJson, safeParseLLMJsonOr, LLMParseError } from "../json-utils";

describe("safeParseLLMJson", () => {
  it("should parse clean JSON", () => {
    const result = safeParseLLMJson<{ a: number }>('{"a":1}');
    expect(result.a).toBe(1);
  });

  it("should strip markdown code fences", () => {
    const result = safeParseLLMJson<{ a: number }>("```json\n{\"a\":1}\n```");
    expect(result.a).toBe(1);
  });

  it("should strip plain code fences", () => {
    const result = safeParseLLMJson<{ a: number }>("```\n{\"a\":1}\n```");
    expect(result.a).toBe(1);
  });

  it("should extract JSON from explanatory text", () => {
    const result = safeParseLLMJson<{ a: number }>("结果是：{\"a\":1}，请查收");
    expect(result.a).toBe(1);
  });

  it("should throw LLMParseError for invalid input", () => {
    expect(() => safeParseLLMJson("not json")).toThrow(LLMParseError);
  });

  it("should throw LLMParseError for empty input", () => {
    expect(() => safeParseLLMJson("")).toThrow(LLMParseError);
  });
});

describe("safeParseLLMJsonOr", () => {
  it("should return parsed result on success", () => {
    const result = safeParseLLMJsonOr<{ a: number }>('{"a":1}', { a: 0 });
    expect(result.a).toBe(1);
  });

  it("should return fallback on parse failure", () => {
    const result = safeParseLLMJsonOr<{ a: number }>("bad json", { a: 0 });
    expect(result.a).toBe(0);
  });

  it("should call onError callback on failure", () => {
    let called = false;
    safeParseLLMJsonOr("bad json", null, () => { called = true; });
    expect(called).toBe(true);
  });
});
