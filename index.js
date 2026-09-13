const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const Pino = require("pino");

async function iniciarSafira() {
  const { state, saveCreds } = await useMultiFileAuthState("./safira-session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: Pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    const numero = "55SEUNUMERO";

    const codigo = await sock.requestPairingCode(numero);

    console.log("💎 CÓDIGO DA SAFIRA BOT:");
    console.log(codigo);
  }

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("💎 Safira Bot conectada ao WhatsApp!");
    }

    if (connection === "close") {
      const deveReconectar =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (deveReconectar) {
        iniciarSafira();
      }
    }
  });
}

iniciarSafira();
