import { memo, useEffect } from 'react';
import { positions, type Position } from './data/positions';
import { formatCents } from './lib/utils';
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

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    let pending: Record<string, number> = {};
    ws.onmessage = (e) => {
      const msg: Msg = JSON.parse(e.data);
      if (msg.type === 'snapshot') {
        pending = {};
        dispatch(snapshotReceived(msg.prices));
      } else {
        pending[msg.symbol] = msg.priceCents;
      }
    };

    const flushTimer = setInterval(() => {
      if (Object.keys(pending).length === 0) return;
      dispatch(ticksReceived(pending));
      pending = {};
    }, 2000);

    return () => {
      clearInterval(flushTimer);
      ws.close();
    };
  }, [dispatch]);

  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Portfell</h1>
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
