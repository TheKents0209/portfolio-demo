# Portfolio demo (private practice project)

A live portfolio view, built to practise the Coop Pank interview question:
"Imagine an investment app's portfolio view where prices and position values change all the time."
Keep this repo private. Show it by screen share.

    npm run server          fake price stream on ws://localhost:8080 (about 20 ticks a second)
    FLAKY=1 npm run server  same, but drops every connection every 20 s
    npm run dev             the app
    npm test                Vitest

The starting App.tsx is deliberately naive. Exercises, in order:

1. **Measure first.** React DevTools Profiler: how many renders per second, and which rows?
2. **Batch updates.** Buffer ticks and apply them once every 100 to 200 ms (or per animation frame).
3. **Only changed rows re-render.** Move prices to a Redux Toolkit slice keyed by symbol.
   Each row selects only its own price (`useSelector(s => s.prices[symbol])`) and is `React.memo`.
4. **Money done right.** Values stay integer cents; format once with
   `Intl.NumberFormat("et-EE", { style: "currency", currency })`. Test it in Vitest.
5. **Derived values.** Position value and portfolio total come from selectors
   (`createSelector`), never stored. Totals per currency: EUR and USD do not add up.
6. **Stale data and reconnect.** Run with FLAKY=1. Show "hind seisuga 12:03" when the stream is
   down, reconnect with backoff, and use the fresh snapshot on reconnect.
7. **Readable changes.** Brief highlight on a change, not colour alone; `font-variant-numeric:
   tabular-nums` so the table does not jump; screen readers are not told about every tick.

Optional, for the ad's nice-to-haves: a React Native view of the same store; a GraphQL
subscription instead of the raw WebSocket.
