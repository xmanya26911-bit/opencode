import { isUnauthorizedError, OpenCode } from "@opencode/client/promise"
import { normalizeServerUrl } from "@/runtime/server/registry"

export function serverAddress(value: string) {
  if (value.includes("://") && !/^https?:\/\//.test(value.trim())) return
  const normalized = normalizeServerUrl(value)

  if (!normalized || !URL.canParse(normalized)) return
  const url = new URL(normalized)

  if (url.protocol !== "http:" && url.protocol !== "https:") return

  if (url.username || url.password || url.search || url.hash) return

  return normalized
}

// Links printed by `opencode pair` carry a single-use code that the server exchanges for a session token.
export function pairingLink(value: string) {
  const url = URL.parse(value.trim())

  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return
  const code = /^\/auth\/connect\/([A-Za-z0-9_-]+)$/.exec(url.pathname)?.[1]
  const address = serverAddress(url.origin)

  if (!code || !address) return

  return { url: address, code }
}

// A server address typed where a pairing link was expected: a host with no path, so a bare code or a cut-off link
// is not mistaken for a server. Paths stay allowed in the password form, where servers behind a proxy prefix live.
export function bareServerAddress(value: string) {
  const address = serverAddress(value)

  if (!address) return
  const url = new URL(address)

  if (url.pathname !== "/") return

  if (url.hostname !== "localhost" && !url.hostname.includes(".") && !url.hostname.startsWith("[") && !url.port)
    return

  return address
}

// Servers before one-time links paired with `/connect#<credentials>` or `/connect?data=<credentials>`.
export function legacyPairingLink(value: string) {
  const url = URL.parse(value.trim())

  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return false

  return url.pathname === "/connect" && (url.hash.length > 1 || url.searchParams.has("data"))
}

export type Pairing = { readonly url: string; readonly password: string }

export type Redeemed =
  | { readonly type: "paired"; readonly pairing: Pairing }
  | { readonly type: "expired" }
  | { readonly type: "unreachable" }

export function redeemPairingLink(link: { url: string; code: string }) {
  return OpenCode.make({ baseUrl: link.url })
    .server.connect({ code: link.code })
    .then(
      (session): Redeemed => ({ type: "paired", pairing: { url: link.url, password: session.token } }),
      // Only the server's answer proves the code is spent; a failed request leaves it valid.
      (error): Redeemed => (isUnauthorizedError(error) ? { type: "expired" } : { type: "unreachable" }),
    )
}
