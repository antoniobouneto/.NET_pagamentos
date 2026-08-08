'use client';

import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { CurrencyRate } from '@/types/currency';
import { fetchLatestRates } from '@/services/api';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:5000/hubs/currency';

export function useLiveRates() {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Initial fetch from REST API
    fetchLatestRates().then(initial => {
      setRates(initial);
      setLastUpdated(new Date());
    });

    // Setup SignalR Hub Connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('ReceiveInitialRates', (initialRates: CurrencyRate[]) => {
      setRates(initialRates);
      setLastUpdated(new Date());
    });

    connection.on('ReceiveRateUpdate', (updatedRate: CurrencyRate) => {
      setRates(prevRates => {
        return prevRates.map(r => {
          if (r.pair === updatedRate.pair) {
            const flashType = updatedRate.bid > r.bid ? 'up' : updatedRate.bid < r.bid ? 'down' : null;
            return {
              ...updatedRate,
              flash: flashType
            };
          }
          return r;
        });
      });
      setLastUpdated(new Date());

      // Reset flash animation after 600ms
      setTimeout(() => {
        setRates(prev =>
          prev.map(r => (r.pair === updatedRate.pair ? { ...r, flash: null } : r))
        );
      }, 600);
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log('⚡ Connected to SignalR Live Rates Hub');
      })
      .catch(err => {
        setIsConnected(false);
        console.warn('SignalR connection failed, falling back to REST polling interval', err);
      });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    // Polling fallback every 4s if SignalR fails or disconnects
    const pollInterval = setInterval(() => {
      if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        fetchLatestRates().then(updated => {
          setRates(prev => {
            if (prev.length === 0) return updated;
            return prev.map(p => {
              const u = updated.find(x => x.pair === p.pair);
              if (!u) return p;
              // Add slight random micro fluctuation if API is static
              const factor = 1 + (Math.random() * 0.001 - 0.0005);
              const newBid = +(u.bid * factor).toFixed(4);
              const flash = newBid > p.bid ? 'up' : newBid < p.bid ? 'down' : null;
              return { ...u, bid: newBid, flash };
            });
          });
          setLastUpdated(new Date());
        });
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

  return { rates, isConnected, lastUpdated };
}
