import { CurrencyRate, ConversionRequest, ConversionResult, HistoricalPoint, SystemStatus } from '@/types/currency';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const DEFAULT_RATES: CurrencyRate[] = [
  {
    code: 'USD',
    codeIn: 'BRL',
    pair: 'USD/BRL',
    name: 'Dólar Americano / Real',
    bid: 5.6245,
    ask: 5.6295,
    high: 5.6510,
    low: 5.5980,
    pctChange: 0.45,
    change: 0.025,
    timestamp: new Date().toISOString(),
    history: [5.55, 5.57, 5.59, 5.61, 5.60, 5.62, 5.6245]
  },
  {
    code: 'EUR',
    codeIn: 'BRL',
    pair: 'EUR/BRL',
    name: 'Euro / Real Brasileiro',
    bid: 6.1280,
    ask: 6.1340,
    high: 6.1520,
    low: 6.0950,
    pctChange: -0.18,
    change: -0.011,
    timestamp: new Date().toISOString(),
    history: [6.14, 6.13, 6.15, 6.12, 6.13, 6.128]
  },
  {
    code: 'EUR',
    codeIn: 'USD',
    pair: 'EUR/USD',
    name: 'Euro / Dólar Americano',
    bid: 1.0895,
    ask: 1.0901,
    high: 1.0920,
    low: 1.0870,
    pctChange: 0.12,
    change: 0.0013,
    timestamp: new Date().toISOString(),
    history: [1.085, 1.087, 1.088, 1.089, 1.0895]
  },
  {
    code: 'GBP',
    codeIn: 'BRL',
    pair: 'GBP/BRL',
    name: 'Libra Esterlina / Real',
    bid: 7.2840,
    ask: 7.2910,
    high: 7.3100,
    low: 7.2500,
    pctChange: 0.62,
    change: 0.045,
    timestamp: new Date().toISOString(),
    history: [7.21, 7.23, 7.25, 7.27, 7.284]
  },
  {
    code: 'BTC',
    codeIn: 'BRL',
    pair: 'BTC/BRL',
    name: 'Bitcoin / Real',
    bid: 382450.00,
    ask: 382900.00,
    high: 388000.00,
    low: 379000.00,
    pctChange: 2.45,
    change: 9150.00,
    timestamp: new Date().toISOString(),
    history: [375000, 378000, 380000, 381500, 382450]
  }
];

export async function fetchLatestRates(): Promise<CurrencyRate[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/rates`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch rates');
    return await res.json();
  } catch (error) {
    console.warn('Backend offline or unreachable, using default rates', error);
    return DEFAULT_RATES;
  }
}

export async function fetchHistoricalData(pair: string = 'USD/BRL', period: string = '1D'): Promise<HistoricalPoint[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/rates/history?pair=${encodeURIComponent(pair)}&period=${period}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch history');
    return await res.json();
  } catch (error) {
    // Generate dummy smooth history
    const base = pair.includes('USD') ? 5.62 : pair.includes('EUR/USD') ? 1.089 : 6.12;
    const points: HistoricalPoint[] = [];
    const count = period === '1D' ? 24 : period === '1W' ? 7 : period === '1M' ? 30 : 12;
    for (let i = count - 1; i >= 0; i--) {
      const variation = (Math.random() - 0.48) * 0.03;
      const rate = +(base * (1 + variation)).toFixed(4);
      points.push({
        time: period === '1D' ? `${23 - i}:00` : `Dia ${count - i}`,
        rate,
        high: +(rate * 1.004).toFixed(4),
        low: +(rate * 0.996).toFixed(4)
      });
    }
    return points;
  }
}

export async function convertCurrency(req: ConversionRequest): Promise<ConversionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/rates/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Conversion failed');
    return await res.json();
  } catch (error) {
    // Local fallback conversion calculation
    const isUsdBrl = req.from === 'USD' && req.to === 'BRL';
    const isEurBrl = req.from === 'EUR' && req.to === 'BRL';
    const isBrlUsd = req.from === 'BRL' && req.to === 'USD';
    
    let rate = 1;
    if (isUsdBrl) rate = 5.6245;
    else if (isEurBrl) rate = 6.1280;
    else if (isBrlUsd) rate = 1 / 5.6295;
    else if (req.from === 'EUR' && req.to === 'USD') rate = 1.0895;

    const raw = req.amount * rate;
    const fee = +(raw * 0.005).toFixed(2);
    const converted = +(raw - fee).toFixed(2);

    return {
      from: req.from,
      to: req.to,
      originalAmount: req.amount,
      convertedAmount: converted,
      rate: +rate.toFixed(4),
      feeAmount: fee,
      feePercentage: 0.5,
      timestamp: new Date().toISOString(),
      guaranteedUntil: new Date(Date.now() + 30000).toISOString(),
      transactionId: Math.random().toString(36).substring(2, 10).toUpperCase()
    };
  }
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/rates/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Status failed');
    return await res.json();
  } catch (error) {
    return {
      cacheType: 'In-Memory Resilient Cache',
      isRedisConnected: false,
      redisEndpoint: 'localhost:6379',
      trackedPairsCount: 5,
      serverTime: new Date().toISOString()
    };
  }
}
