import { describe, expect, it } from "bun:test"
import {
  createOAuthAuthorizationUrl,
  createOAuthPkcePair,
} from "../src/index"

describe("@hrbr/source-auth OAuth helpers", () => {
  it("creates RFC7636 S256 PKCE values", () => {
    const pair = createOAuthPkcePair("test-verifier")
    expect(pair).toEqual({
      verifier: "test-verifier",
      challenge: "JBbiqONGWPaAmwXk_8bT6UnlPfrn65D32eZlJS-zGG0",
      method: "S256",
    })
  })

  it("builds authorization URLs with PKCE and optional scopes", () => {
    const url = new URL(createOAuthAuthorizationUrl({
      authorizationEndpoint: "https://auth.example.com/oauth/authorize",
      clientId: "client-id",
      redirectUri: "http://127.0.0.1:7331/oauth/callback",
      state: "state-1",
      codeChallenge: "challenge-1",
      scopes: ["read", "write"],
      resource: "https://mcp.example.com/mcp",
    }))

    expect(url.origin + url.pathname).toBe("https://auth.example.com/oauth/authorize")
    expect(url.searchParams.get("response_type")).toBe("code")
    expect(url.searchParams.get("client_id")).toBe("client-id")
    expect(url.searchParams.get("redirect_uri")).toBe("http://127.0.0.1:7331/oauth/callback")
    expect(url.searchParams.get("state")).toBe("state-1")
    expect(url.searchParams.get("code_challenge")).toBe("challenge-1")
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    expect(url.searchParams.get("scope")).toBe("read write")
    expect(url.searchParams.get("resource")).toBe("https://mcp.example.com/mcp")
  })
})
