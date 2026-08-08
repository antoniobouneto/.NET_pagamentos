using System.Text.Json;
using Backend.Models;
using Microsoft.Extensions.Caching.Memory;
using StackExchange.Redis;

namespace Backend.Services
{
    public class RedisCacheService : IRedisCacheService
    {
        private readonly IConnectionMultiplexer? _redis;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<RedisCacheService> _logger;
        private readonly IDatabase? _db;
        private readonly bool _isConnected;

        public bool IsRedisConnected => _isConnected;

        public RedisCacheService(
            IConfiguration configuration,
            IMemoryCache memoryCache,
            ILogger<RedisCacheService> logger)
        {
            _memoryCache = memoryCache;
            _logger = logger;

            string connectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379,connectTimeout=2000,abortConnect=false";

            try
            {
                _redis = ConnectionMultiplexer.Connect(connectionString);
                _db = _redis.GetDatabase();
                _isConnected = _redis.IsConnected;

                if (_isConnected)
                {
                    _logger.LogInformation("🚀 Redis connected successfully at {Endpoint}", connectionString);
                }
                else
                {
                    _logger.LogWarning("⚠️ Redis multiplexer initialized but connection status is false. Falling back to IMemoryCache.");
                }
            }
            catch (Exception ex)
            {
                _isConnected = false;
                _logger.LogWarning("⚠️ Could not connect to Redis: {Message}. Operating in resilient In-Memory Cache mode.", ex.Message);
            }
        }

        public async Task SetRateAsync(CurrencyRate rate)
        {
            string key = $"rates:{rate.Pair.Replace('/', '_')}";
            string json = JsonSerializer.Serialize(rate);

            // Always save to MemoryCache as fast-path buffer
            _memoryCache.Set(key, rate, TimeSpan.FromMinutes(10));

            if (_isConnected && _db != null)
            {
                try
                {
                    await _db.StringSetAsync(key, json, TimeSpan.FromMinutes(10));
                    await _db.SetAddAsync("rates:pairs", rate.Pair);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to set key in Redis");
                }
            }
        }

        public async Task<CurrencyRate?> GetRateAsync(string pair)
        {
            string key = $"rates:{pair.Replace('/', '_')}";

            if (_memoryCache.TryGetValue(key, out CurrencyRate? cachedRate) && cachedRate != null)
            {
                return cachedRate;
            }

            if (_isConnected && _db != null)
            {
                try
                {
                    RedisValue val = await _db.StringGetAsync(key);
                    if (val.HasValue)
                    {
                        var rate = JsonSerializer.Deserialize<CurrencyRate>(val.ToString());
                        if (rate != null)
                        {
                            _memoryCache.Set(key, rate, TimeSpan.FromMinutes(10));
                            return rate;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error getting key from Redis");
                }
            }

            return null;
        }

        public async Task<List<CurrencyRate>> GetAllRatesAsync()
        {
            var list = new List<CurrencyRate>();

            if (_isConnected && _db != null)
            {
                try
                {
                    RedisValue[] pairs = await _db.SetMembersAsync("rates:pairs");
                    foreach (var pairVal in pairs)
                    {
                        string pairStr = pairVal.ToString();
                        var rate = await GetRateAsync(pairStr);
                        if (rate != null) list.Add(rate);
                    }

                    if (list.Count > 0) return list;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error fetching all rates from Redis");
                }
            }

            // Fallback to searching MemoryCache
            var pairsList = new[] { "USD/BRL", "EUR/BRL", "EUR/USD", "GBP/BRL", "BTC/BRL" };
            foreach (var pair in pairsList)
            {
                string key = $"rates:{pair.Replace('/', '_')}";
                if (_memoryCache.TryGetValue(key, out CurrencyRate? rate) && rate != null)
                {
                    list.Add(rate);
                }
            }

            return list;
        }

        public async Task PublishRateUpdateAsync(CurrencyRate rate)
        {
            if (_isConnected && _redis != null)
            {
                try
                {
                    ISubscriber subscriber = _redis.GetSubscriber();
                    string json = JsonSerializer.Serialize(rate);
                    await subscriber.PublishAsync(RedisChannel.Literal("rates:update"), json);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error publishing update to Redis channel");
                }
            }
        }
    }
}
