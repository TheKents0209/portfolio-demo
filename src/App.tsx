// Starting point, deliberately naive: every tick replaces the whole price map in
// useState, so the WHOLE table re-renders about 20 times a second. Measure it with
// the React DevTools Profiler, then fix it. See README.md for the exercises.
import { useEffect, useState } from "react";
import { positions } from "./data/positions";

type Msg =
  | { type: "snapshot"; prices: Record<string, number>; ts: number }
  | { type: "tick"; symbol: string; priceCents: number; ts: number };

export default function App() {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (e) => {
      const msg: Msg = JSON.parse(e.data);
      if (msg.type === "snapshot") setPrices(msg.prices);
      else setPrices((p) => ({ ...p, [msg.symbol]: msg.priceCents }));
    };
    return () => ws.close();
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Portfell</h1>
      <table>
        <thead>
          <tr><th>Väärtpaber</th><th>Kogus</th><th>Hind</th><th>Väärtus</th></tr>
        </thead>
        <tbody>
          {positions.map((p) => {
            const price = prices[p.symbol];
            return (
              <tr key={p.symbol}>
                <td>{p.name}</td>
                <td>{p.quantity}</td>
                {/* TODO: floats and no currency formatting. Fix both (README, exercise 4). */}
                <td>{price === undefined ? "..." : price / 100}</td>
                <td>{price === undefined ? "..." : (price / 100) * p.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
