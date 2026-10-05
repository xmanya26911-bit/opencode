import { useLanguage } from "@/runtime/i18n/language"
import { usePlatform } from "@/runtime/platform/platform"
import { isMixedContent } from "./browser"
import { legacyPairingLink, pairingLink, redeemPairingLink, type Pairing } from "./pairing"

export type Redemption = { readonly pairing: Pairing } | { readonly error: string }

// Pasted and scanned links share one redeem path so every surface explains a failure the same way.
// Resolves undefined when the value is not a pairing link at all.
export function useRedeemPairing() {
  const language = useLanguage()
  const platform = usePlatform()

  return async (value: string): Promise<Redemption | undefined> => {
    const link = pairingLink(value)

    if (!link) return legacyPairingLink(value) ? { error: language.t("server.connect.link.legacy") } : undefined
    const result = await redeemPairingLink(link)

    if (result.type === "paired") return { pairing: result.pairing }

    if (result.type === "expired") return { error: language.t("server.connect.link.expired") }

    if (platform.platform === "web" && isMixedContent(location.href, link.url))
      return { error: language.t("server.connect.mixedContent") }

    return { error: language.t("server.connect.link.unreachable", { url: link.url }) }
  }
}
