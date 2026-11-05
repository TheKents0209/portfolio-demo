# Portfolio demo

A live portfolio table (in Estonian) that shows 10 holdings with prices streamed over a WebSocket.

## Run it

    npm install
    npm run server          fake price stream on ws://localhost:8080 (about 20 ticks a second)
    FLAKY=1 npm run server  same, but drops every connection every 20 s
    npm run dev             the app (Vite)
    npm test                Vitest

## How it works

- **Price server** (`server/price-server.ts`): holds prices for 10 symbols as integer cents, plus a
  fake `EURUSD` rate (USD per 1 EUR, stored as an integer × 100 000, so `108345` = 1.08345).
  A new client gets one `snapshot` message with every price. After that, every 50 ms a random
  symbol moves by about 0.4% and every client gets a `tick` message (`{ symbol, priceCents, timestamp }`).
- **Holdings** (`src/data/positions.ts`): a fixed list of symbol, name, quantity and currency
  (EUR or USD). Only quantities are stored; values are computed from the live price.
- **Store** (`src/redux/`): a Redux Toolkit slice holds a `symbol → priceCents` map.
  `snapshotReceived` replaces the whole map, `ticksReceived` merges changed prices into it.
- **App** (`src/App.tsx`): opens the WebSocket. A snapshot is dispatched at once. Ticks are
  buffered and dispatched as one batch every 2 s. Each table row is `React.memo` and selects
  only its own price, so a batch re-renders only the rows whose price changed.
- **Total** (`Total` in `src/App.tsx`): converts USD values to EUR with the `EURUSD` rate
  (`Math.round(usdCents × 100 000 / rate)`) and shows the whole portfolio in EUR. It has its own
  component and selector, so only that line re-renders when the total changes. Shows `...` until
  the rate and every price have arrived.
- **Reconnect** (`src/App.tsx`): when the socket closes, the app retries with exponential backoff
  (`createBackoff` in `src/lib/utils.ts`: starts at 0.5 s, doubles each failed attempt, capped at
  30 s, with jitter). A successful connect resets the delay. While disconnected, a
  "Disconnected, retrying in N" countdown shows above the table. The server sends a fresh
  snapshot on every connect, so prices catch up right away. Unmounting stops any pending retry.
- **Formatting** (`src/lib/utils.ts`): money stays in integer cents until display, then goes
  through a cached `Intl.NumberFormat('et-EE')` per currency, e.g. `3,12 €`, `228,41 $`.
  Numeric columns use `tabular-nums` so the table does not jump.

Columns: Aktsia (stock), Kogus (quantity), Hind (price), Väärtus (value = price × quantity).
Prices show `...` until the first snapshot arrives.

## Tests

- `src/lib/utils.test.ts`: currency formatting (decimal comma, grouping, small amounts), and
  `createBackoff` (doubling up to the cap, reset, jitter range).
- `src/redux/slices/stockSlice.test.ts`: snapshot replaces, ticks merge, state is not mutated.
- `src/float.test.ts`: why money is kept in cents.

## Not done yet

- The EURUSD rate is fake, and it moves by the same ~0.4% step as the stocks, which is far more than
  a real exchange rate moves. A live feed (for example Finnhub's WebSocket) would replace it on the
  server side.
- No test for the total conversion yet.
