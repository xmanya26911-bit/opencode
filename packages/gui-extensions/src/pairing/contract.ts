import { Schema } from "effect"
import { Ipc } from "../sdk"

export const PairingInfo = Schema.Struct({ urls: Schema.Array(Schema.String) })

/** A single-use code for an `/auth/connect/:code` link, and the seconds until the server forgets it. */
export const PairingCode = Schema.Struct({ code: Schema.String, expiresIn: Schema.Number })

/** Pairs other devices with this machine's local server and keeps its display awake. */
export const Pairing = Ipc.define({
  id: "pairing",
  methods: {
    /** The local server's advertised URLs. */
    info: { output: PairingInfo },
    /** A new pairing code. */
    code: { output: PairingCode },
    screenActive: { output: Schema.Boolean },
    setScreenActive: { input: Schema.Boolean },
  },
})
