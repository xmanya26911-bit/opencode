import { PairingHost, pairingClient } from "../../../storybook/.storybook/mocks/gui-extensions/pairing"
import PairingPage from "./page"

const story = (urls: readonly string[], links?: { custom?: string; selected?: string }) => ({
  render: () => {
    const client = pairingClient(urls)

    return (
      <PairingHost links={links}>
        <PairingPage pairing={() => ({ status: "active", value: client, generation: 1 })} />
      </PairingHost>
    )
  },
})

export default {
  title: "Extensions/Pairing",
  id: "extensions-pairing",
  parameters: {
    docs: {
      description: {
        component: "Settings → Pairing on desktop: the addresses a pairing link can use, and its QR code.",
      },
    },
  },
}

/** The server listens on the local network and on a Tailscale or VPN address. */
export const NetworkAddresses = story(["http://127.0.0.1:49374", "http://192.168.10.248:49374", "http://100.87.251.43:49374"])

/** A saved custom address, such as a Tailscale Serve or reverse proxy URL, is offered first. */
export const CustomAddress = story(["http://127.0.0.1:49374", "http://192.168.10.248:49374"], {
  custom: "https://lukeblade.tail07b29b.ts.net",
})

/** The default service only listens on this computer, so the page explains how to let other devices in. */
export const OnlyThisComputer = story(["http://127.0.0.1:49374"])
