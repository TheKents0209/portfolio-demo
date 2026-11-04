// Fake price stream. Run: npm run server   (ws://localhost:8080)
// Prices are integer cents, never floats.
// FLAKY=1 npm run server  drops every connection every 20 s, to practise reconnecting.
import { WebSocketServer, type WebSocket } from "ws";

const prices: Record<string, number> = {
  LHV1T: 312, TAL1T: 289, TKM1T: 1078, EFT1T: 2215, CPA1T: 1834,
  AAPL: 22841, MSFT: 41295, NOVO: 6930, ASML: 68120, NOKIA: 452,
};

const wss = new WebSocketServer({ port: 8080 });

function send(ws: WebSocket, msg: unknown) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

wss.on("connection", (ws) => {
  // A fresh client gets every price once, then only changes.
  send(ws, { type: "snapshot", prices, ts: Date.now() });
});

// About 20 changes a second, spread over random instruments.
setInterval(() => {
  const symbols = Object.keys(prices);
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const step = Math.max(1, Math.round(prices[symbol] * 0.004));
  prices[symbol] = Math.max(1, prices[symbol] + (Math.random() < 0.5 ? -step : step));
  for (const ws of wss.clients) send(ws, { type: "tick", symbol, priceCents: prices[symbol], ts: Date.now() });
}, 50);

if (process.env.FLAKY) {
  setInterval(() => {
    console.log("dropping all connections");
    for (const ws of wss.clients) ws.terminate();
  }, 20_000);
}

console.log("price stream on ws://localhost:8080" + (process.env.FLAKY ? " (flaky)" : ""));
