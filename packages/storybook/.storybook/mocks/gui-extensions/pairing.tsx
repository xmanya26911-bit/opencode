import { useDialog } from "@opencode/ui/context/dialog"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import type { JSX } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { ExtensionContext, useExtension, type IpcClient } from "../../../../gui-extensions/src/sdk"
import type { Pairing } from "../../../../gui-extensions/src/pairing/contract"
// The pairing page renders inside the app's settings page, which brings these styles.
import "@/settings/settings.css"

type Links = { custom: string; selected: string }

/** A pairing main entry that answers with fixed addresses and a fresh code. */
export function pairingClient(urls: readonly string[]): IpcClient<typeof Pairing.spec> {
  return {
    info: async () => ({ urls }),
    code: async () => ({ code: Math.random().toString(36).slice(2).padEnd(22, "x"), expiresIn: 300 }),
    screenActive: async () => false,
    setScreenActive: async () => undefined,
    state: () => undefined,
    on: () => () => undefined,
  }
}

/**
 * Stands in for the HostApis the pairing page reads that extension stories do not provide: its window store, dialogs
 * through the app's dialog stack, and a clipboard that accepts every copy.
 */
export function PairingHost(props: { links?: Partial<Links>; children: JSX.Element }) {
  const base = useExtension()
  const dialog = useDialog()
  const [links, setLinks] = createStore<Links>({ custom: "", selected: "", ...props.links })
  const client = new QueryClient()
  // Dialogs render in the app's dialog stack, outside this subtree, so they get the context again as the host does.
  const scoped = (render: () => JSX.Element) => (
    <QueryClientProvider client={client}>
      <ExtensionContext.Provider value={context}>{render()}</ExtensionContext.Provider>
    </QueryClientProvider>
  )
  const context = Object.create(base, {
    stores: {
      value: {
        links: {
          get value() {
            return links
          },
          ready: () => true,
          update: (mutate: (draft: Links) => undefined) => setLinks(produce(mutate)),
          set: (next: Links) => setLinks(next),
        },
      },
    },
    dialogs: {
      value: {
        open: (render: () => JSX.Element) => {
          void dialog.show(() => scoped(render))
          return { close: () => dialog.close() }
        },
      },
    },
    system: { value: { copy: async () => undefined } },
  })

  return scoped(() => (
    <div class="settings-screen" style={{ "max-width": "820px", padding: "32px", margin: "0 auto" }}>
      {props.children}
    </div>
  ))
}
