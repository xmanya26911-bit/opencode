import { describe, expect, test } from "bun:test"
import { legacyPairingLink, pairingLink } from "./pairing"

describe("pairing link", () => {
  test("reads the server address and code from opencode pair links", () => {
    expect(pairingLink(" http://192.168.1.2:49374/auth/connect/abc_DEF-123 ")).toEqual({
      url: "http://192.168.1.2:49374",
      code: "abc_DEF-123",
    })
  })

  test("rejects other URLs", () => {
    expect(pairingLink("http://192.168.1.2:49374/auth/connect/")).toBeUndefined()
    expect(pairingLink("http://192.168.1.2:49374/auth/connect/abc/extra")).toBeUndefined()
    expect(pairingLink("http://192.168.1.2:49374/connect#abc")).toBeUndefined()
    expect(pairingLink("opencode-ios://auth/connect/abc")).toBeUndefined()
    expect(pairingLink("192.168.1.2:49374")).toBeUndefined()
  })

  test("recognizes the credential links that servers printed before one-time links", () => {
    expect(legacyPairingLink("http://192.168.1.2:49374/connect#eyJ1c2VybmFtZSI6Im9wZW5jb2RlIn0")).toBe(true)
    expect(legacyPairingLink("http://192.168.1.2:49374/connect?data=eyJ1c2VybmFtZSI6Im9wZW5jb2RlIn0")).toBe(true)
    expect(legacyPairingLink("http://192.168.1.2:49374/connect")).toBe(false)
    expect(legacyPairingLink("http://192.168.1.2:49374/auth/connect/abc")).toBe(false)
  })
})
