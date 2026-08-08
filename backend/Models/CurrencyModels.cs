namespace Backend.Models
{
    public class CurrencyRate
    {
        public string Code { get; set; } = string.Empty; // e.g. USD
        public string CodeIn { get; set; } = string.Empty; // e.g. BRL
        public string Pair => $"{Code}/{CodeIn}";
        public string Name { get; set; } = string.Empty; // e.g. Dólar Americano / Real Brasileiro
        public decimal Bid { get; set; } // Buying rate
        public decimal Ask { get; set; } // Selling rate
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal PctChange { get; set; } // 24h percentage change
        public decimal Change { get; set; } // 24h value change
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public List<decimal> History { get; set; } = new();
    }

    public class ConversionRequest
    {
        public string From { get; set; } = "USD";
        public string To { get; set; } = "BRL";
        public decimal Amount { get; set; } = 100m;
    }

    public class ConversionResult
    {
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public decimal OriginalAmount { get; set; }
        public decimal ConvertedAmount { get; set; }
        public decimal Rate { get; set; }
        public decimal FeeAmount { get; set; }
        public decimal FeePercentage { get; set; } = 0.5m; // Revolut standard low exchange fee
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public DateTime GuaranteedUntil { get; set; } = DateTime.UtcNow.AddSeconds(30);
        public string TransactionId { get; set; } = Guid.NewGuid().ToString("N")[..8].ToUpper();
    }

    public class HistoricalPoint
    {
        public string Time { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
    }

    public class SystemStatus
    {
        public string CacheType { get; set; } = "Redis"; // "Redis" or "InMemory (Fallback)"
        public bool IsRedisConnected { get; set; }
        public string RedisEndpoint { get; set; } = "localhost:6379";
        public int TrackedPairsCount { get; set; }
        public DateTime ServerTime { get; set; } = DateTime.UtcNow;
    }
}
