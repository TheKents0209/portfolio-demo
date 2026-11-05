import { memo, useEffect, useState } from 'react';
import { positions, type Position } from './data/positions';
import { createBackoff, formatCents } from './lib/utils';
import { useAppDispatch, useAppSelector } from './lib/hooks';
import { snapshotReceived, ticksReceived } from './redux/slices/stockSlice';

type Msg =
  | { type: 'snapshot'; prices: Record<string, number>; timestamp: number }
  | { type: 'tick'; symbol: string; priceCents: number; timestamp: number };

const Row = memo(function Row({ position }: { position: Position }) {
  const price = useAppSelector((stock) => stock.pricesReducer[position.symbol]);
  const [prev, setPrev] = useState(price);
  const [dir, setDir] = useState<'up' | 'down' | null>(null);

  if (price !== prev) {
    setPrev(price);
    if (prev !== undefined && price !== undefined) {
      setDir(price > prev ? 'up' : 'down');
    }
  }

  return (
    <tr>
      <td>{position.name}</td>
      <td>{position.quantity}</td>
      <td>
        <p key={price} className={dir ?? undefined}>
          {price === undefined ? '...' : formatCents(price, position.currency)}
        </p>
      </td>
      <td>
        {price === undefined ? '...' : formatCents(price * position.quantity, position.currency)}
      </td>
    </tr>
  );
});

const Total = () => {
  const total = useAppSelector((selector) => {
    const prices = selector.pricesReducer;
    const rate = prices.EURUSD;
    if (rate === undefined) return undefined;
    let eurCents = 0;
    for (const position of positions) {
      const price = prices[position.symbol];
      if (price === undefined) return undefined;
      const value = price * position.quantity;
      eurCents += position.currency === 'EUR' ? value : Math.round((value * 100_000) / rate);
    }
    return eurCents;
  });
  return <p>Väärtus kokku: {total === undefined ? '...' : formatCents(total, 'EUR')}</p>;
};

const RetryInTimer = ({ retryAt }: { retryAt: number | null }) => {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (retryAt === null) return;

    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now), 1000);

    return () => {
      clearInterval(interval);
    };
  }, [retryAt]);

  if (retryAt === null) return null;
  return <p>Disconnected, retrying in {Math.max(0, Math.ceil((retryAt - now) / 1000))}</p>;
};

export default function App() {
  const dispatch = useAppDispatch();
  const [retryAt, setRetryAt] = useState<number | null>(null);

  useEffect(() => {
    let pending: Record<string, number> = {};
    let ws: WebSocket;
    let isDisposed: boolean = false;
    let closerTimeout: ReturnType<typeof setTimeout> | undefined;

    const backoff = createBackoff();

    function connect() {
      ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        backoff.reset();
        setRetryAt(null);
      };

      ws.onclose = () => {
        if (isDisposed) return;
        const delay = backoff.next();
        closerTimeout = setTimeout(() => connect(), delay);
        setRetryAt(Date.now() + delay);
      };

      ws.onmessage = (e) => {
        const msg: Msg = JSON.parse(e.data);
        if (msg.type === 'snapshot') {
          pending = {};
          dispatch(snapshotReceived(msg.prices));
        } else {
          pending[msg.symbol] = msg.priceCents;
        }
      };
    }

    connect();

    const flushTimer = setInterval(() => {
      if (Object.keys(pending).length === 0) return;
      dispatch(ticksReceived(pending));
      pending = {};
    }, 2000);

    return () => {
      isDisposed = true;
      clearInterval(flushTimer);
      clearTimeout(closerTimeout);
      ws.close();
    };
  }, [dispatch]);

  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Portfell</h1>
      <RetryInTimer retryAt={retryAt} />
      <Total />

      <table>
        <thead>
          <tr>
            <th>Aktsia</th>
            <th>Kogus</th>
            <th>Hind</th>
            <th>Väärtus</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <Row key={position.symbol} position={position} />
          ))}
        </tbody>
      </table>
    </main>
  );
}
