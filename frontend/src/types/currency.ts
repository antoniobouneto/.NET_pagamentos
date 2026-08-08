export interface CurrencyRate {
  code: string;
  codeIn: string;
  pair: string;
  name: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  pctChange: number;
  change: number;
  timestamp: string;
  history: number[];
  flash?: 'up' | 'down' | null;
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: number;
}

export interface ConversionResult {
  from: string;
  to: string;
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  feeAmount: number;
  feePercentage: number;
  timestamp: string;
  guaranteedUntil: string;
  transactionId: string;
}

export interface HistoricalPoint {
  time: string;
  rate: number;
  high: number;
  low: number;
}

export interface SystemStatus {
  cacheType: string;
  isRedisConnected: boolean;
  redisEndpoint: string;
  trackedPairsCount: number;
  serverTime: string;
}

export interface Transaction {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: string;
  status: 'Completed' | 'Pending';
}
