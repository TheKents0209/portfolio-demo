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

  return (
    <tr>
      <td>{position.name}</td>
      <td>{position.quantity}</td>
      <td className="price">
        <p>{price === undefined ? '...' : formatCents(price, position.currency)}</p>
      </td>
      <td>
        {price === undefined ? '...' : formatCents(price * position.quantity, position.currency)}
      </td>
    </tr>
  );
});

const RetryInTimer = ({ retryAt }: { retryAt: number | null }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (retryAt === null) return;

    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);

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

      <table>
        <thead>
          <tr>
            <th>Väärtpaber</th>
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
