using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatesController : ControllerBase
    {
        private readonly IRedisCacheService _cacheService;
        private readonly CurrencyService _currencyService;

        public RatesController(IRedisCacheService cacheService, CurrencyService currencyService)
        {
            _cacheService = cacheService;
            _currencyService = currencyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRates()
        {
            var rates = await _cacheService.GetAllRatesAsync();
            if (!rates.Any())
            {
                await _currencyService.RefreshRatesFromApiAsync();
                rates = await _cacheService.GetAllRatesAsync();
            }
            return Ok(rates);
        }

        [HttpGet("{from}/{to}")]
        public async Task<IActionResult> GetSingleRate(string from, string to)
        {
            string pair = $"{from.ToUpper()}/{to.ToUpper()}";
            var rate = await _cacheService.GetRateAsync(pair);
            if (rate == null)
            {
                return NotFound(new { message = $"Rate for pair {pair} not found." });
            }
            return Ok(rate);
        }

        [HttpPost("convert")]
        public async Task<IActionResult> ConvertCurrency([FromBody] ConversionRequest req)
        {
            if (req.Amount <= 0)
            {
                return BadRequest(new { message = "Amount must be greater than 0" });
            }

            string pair = $"{req.From.ToUpper()}/{req.To.ToUpper()}";
            var rateObj = await _cacheService.GetRateAsync(pair);

            decimal exchangeRate = 1.0m;

            if (rateObj != null)
            {
                exchangeRate = rateObj.Bid;
            }
            else if (req.From.Equals("BRL", StringComparison.OrdinalIgnoreCase))
            {
                // Inverse conversion e.g. BRL to USD
                string invPair = $"{req.To.ToUpper()}/BRL";
                var invRate = await _cacheService.GetRateAsync(invPair);
                if (invRate != null && invRate.Bid > 0)
                {
                    exchangeRate = 1.0m / invRate.Ask;
                }
                else
                {
                    exchangeRate = 0.18m; // fallback BRL/USD
                }
            }
            else
            {
                exchangeRate = 1.0m;
            }

            decimal rawConverted = req.Amount * exchangeRate;
            decimal feePercentage = 0.5m; // 0.5% standard Revolut fee
            decimal feeAmount = Math.Round(rawConverted * (feePercentage / 100m), 2);
            decimal finalAmount = Math.Round(rawConverted - feeAmount, 2);

            var result = new ConversionResult
            {
                From = req.From.ToUpper(),
                To = req.To.ToUpper(),
                OriginalAmount = req.Amount,
                ConvertedAmount = finalAmount,
                Rate = Math.Round(exchangeRate, 4),
                FeeAmount = feeAmount,
                FeePercentage = feePercentage,
                Timestamp = DateTime.UtcNow,
                GuaranteedUntil = DateTime.UtcNow.AddSeconds(30)
            };

            return Ok(result);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] string pair = "USD/BRL", [FromQuery] string period = "1D")
        {
            var rateObj = await _cacheService.GetRateAsync(pair) ?? await _cacheService.GetRateAsync("USD/BRL");
            decimal baseRate = rateObj?.Bid ?? 5.62m;

            int pointsCount = period switch
            {
                "1D" => 24,
                "1W" => 7,
                "1M" => 30,
                "1Y" => 12,
                _ => 24
            };

            var list = new List<HistoricalPoint>();
            var random = new Random(42);
            DateTime now = DateTime.UtcNow;

            for (int i = pointsCount - 1; i >= 0; i--)
            {
                DateTime time = period switch
                {
                    "1D" => now.AddHours(-i),
                    "1W" => now.AddDays(-i),
                    "1M" => now.AddDays(-i),
                    "1Y" => now.AddMonths(-i),
                    _ => now.AddHours(-i)
                };

                double variation = (random.NextDouble() - 0.49) * 0.03;
                decimal ptRate = Math.Round(baseRate * (1 + (decimal)variation), 4);
                decimal high = Math.Round(ptRate * 1.004m, 4);
                decimal low = Math.Round(ptRate * 0.996m, 4);

                string label = period switch
                {
                    "1D" => time.ToString("HH:00"),
                    "1W" => time.ToString("ddd"),
                    "1M" => time.ToString("dd MMM"),
                    "1Y" => time.ToString("MMM yyyy"),
                    _ => time.ToString("HH:00")
                };

                list.Add(new HistoricalPoint
                {
                    Time = label,
                    Rate = ptRate,
                    High = high,
                    Low = low
                });
            }

            return Ok(list);
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var rates = await _cacheService.GetAllRatesAsync();
            var status = new SystemStatus
            {
                CacheType = _cacheService.IsRedisConnected ? "Redis DB" : "In-Memory Resilient Cache",
                IsRedisConnected = _cacheService.IsRedisConnected,
                RedisEndpoint = "localhost:6379",
                TrackedPairsCount = rates.Count,
                ServerTime = DateTime.UtcNow
            };
            return Ok(status);
        }
    }
}
