using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Backend.Models;

namespace Backend.Services
{
    public class CurrencyService
    {
        private readonly HttpClient _httpClient;
        private readonly IRedisCacheService _cacheService;
        private readonly ILogger<CurrencyService> _logger;
        private static readonly Random _random = new();

        public CurrencyService(
            HttpClient httpClient,
            IRedisCacheService cacheService,
            ILogger<CurrencyService> logger)
        {
            _httpClient = httpClient;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task RefreshRatesFromApiAsync()
        {
            try
            {
                // Fetch USD-BRL, EUR-BRL, EUR-USD, GBP-BRL, BTC-BRL from AwesomeAPI
                var response = await _httpClient.GetFromJsonAsync<Dictionary<string, AwesomeApiRate>>(
                    "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,EUR-USD,GBP-BRL,BTC-BRL");

                if (response != null)
                {
                    foreach (var kvp in response)
                    {
                        var raw = kvp.Value;
                        decimal bid = parseDecimal(raw.Bid);
                        decimal ask = parseDecimal(raw.Ask);
                        decimal high = parseDecimal(raw.High);
                        decimal low = parseDecimal(raw.Low);
                        decimal pctChange = parseDecimal(raw.PctChange);
                        decimal change = parseDecimal(raw.VarBid);

                        string code = raw.Code;
                        string codeIn = raw.CodeIn;
                        string pair = $"{code}/{codeIn}";

                        var existing = await _cacheService.GetRateAsync(pair);
                        var history = existing?.History ?? generateInitialHistory(bid);

                        var rate = new CurrencyRate
                        {
                            Code = code,
                            CodeIn = codeIn,
                            Name = getCurrencyName(code, codeIn),
                            Bid = bid,
                            Ask = ask,
                            High = high > 0 ? high : bid * 1.01m,
                            Low = low > 0 ? low : bid * 0.99m,
                            PctChange = pctChange,
                            Change = change,
                            Timestamp = DateTime.UtcNow,
                            History = history
                        };

                        await _cacheService.SetRateAsync(rate);
                        await _cacheService.PublishRateUpdateAsync(rate);
                    }
                    _logger.LogInformation("✅ Currency rates successfully updated from live FX API");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("⚠️ Could not fetch from live API: {Message}. Seeding fallback live market data.", ex.Message);
                await seedFallbackRatesAsync();
            }
        }

        public async Task<CurrencyRate> SimulateMicroTickAsync(string pair)
        {
            var rate = await _cacheService.GetRateAsync(pair);
            if (rate == null)
            {
                await seedFallbackRatesAsync();
                rate = await _cacheService.GetRateAsync(pair);
                if (rate == null) return new CurrencyRate();
            }

            // Create micro tick (-0.15% to +0.15%)
            double factor = 1.0 + (_random.NextDouble() * 0.003 - 0.0015);
            decimal newBid = Math.Round(rate.Bid * (decimal)factor, 4);
            if (rate.Code == "BTC") newBid = Math.Round(rate.Bid * (decimal)factor, 2);

            decimal spread = newBid * 0.0015m; // 0.15% spread
            decimal newAsk = Math.Round(newBid + spread, 4);

            rate.Bid = newBid;
            rate.Ask = newAsk;
            rate.Timestamp = DateTime.UtcNow;

            if (newBid > rate.High) rate.High = newBid;
            if (newBid < rate.Low) rate.Low = newBid;

            rate.History.Add(newBid);
            if (rate.History.Count > 30) rate.History.RemoveAt(0);

            await _cacheService.SetRateAsync(rate);
            await _cacheService.PublishRateUpdateAsync(rate);

            return rate;
        }

        private async Task seedFallbackRatesAsync()
        {
            var fallbackRates = new List<CurrencyRate>
            {
                new CurrencyRate
                {
                    Code = "USD", CodeIn = "BRL", Name = "Dólar Americano / Real",
                    Bid = 5.6245m, Ask = 5.6295m, High = 5.6510m, Low = 5.5980m,
                    PctChange = 0.45m, Change = 0.025m, History = generateInitialHistory(5.6245m)
                },
                new CurrencyRate
                {
                    Code = "EUR", CodeIn = "BRL", Name = "Euro / Real Brasileiro",
                    Bid = 6.1280m, Ask = 6.1340m, High = 6.1520m, Low = 6.0950m,
                    PctChange = -0.18m, Change = -0.011m, History = generateInitialHistory(6.1280m)
                },
                new CurrencyRate
                {
                    Code = "EUR", CodeIn = "USD", Name = "Euro / Dólar Americano",
                    Bid = 1.0895m, Ask = 1.0901m, High = 1.0920m, Low = 1.0870m,
                    PctChange = 0.12m, Change = 0.0013m, History = generateInitialHistory(1.0895m)
                },
                new CurrencyRate
                {
                    Code = "GBP", CodeIn = "BRL", Name = "Libra Esterlina / Real",
                    Bid = 7.2840m, Ask = 7.2910m, High = 7.3100m, Low = 7.2500m,
                    PctChange = 0.62m, Change = 0.045m, History = generateInitialHistory(7.2840m)
                },
                new CurrencyRate
                {
                    Code = "BTC", CodeIn = "BRL", Name = "Bitcoin / Real Brasileiro",
                    Bid = 382450.00m, Ask = 382900.00m, High = 388000.00m, Low = 379000.00m,
                    PctChange = 2.45m, Change = 9150.00m, History = generateInitialHistory(382450.00m)
                }
            };

            foreach (var r in fallbackRates)
            {
                await _cacheService.SetRateAsync(r);
            }
        }

        private static List<decimal> generateInitialHistory(decimal baseVal)
        {
            var list = new List<decimal>();
            decimal current = baseVal * 0.98m;
            for (int i = 0; i < 25; i++)
            {
                double change = (_random.NextDouble() - 0.48) * 0.01;
                current = Math.Round(current * (1 + (decimal)change), 4);
                list.Add(current);
            }
            list.Add(baseVal);
            return list;
        }

        private static decimal parseDecimal(string? val)
        {
            if (string.IsNullOrWhiteSpace(val)) return 0m;
            return decimal.TryParse(val, System.Globalization.CultureInfo.InvariantCulture, out decimal result) ? result : 0m;
        }

        private static string getCurrencyName(string code, string codeIn)
        {
            return (code, codeIn) switch
            {
                ("USD", "BRL") => "Dólar Americano / Real",
                ("EUR", "BRL") => "Euro / Real Brasileiro",
                ("EUR", "USD") => "Euro / Dólar Americano",
                ("GBP", "BRL") => "Libra Esterlina / Real",
                ("BTC", "BRL") => "Bitcoin / Real",
                _ => $"{code} / {codeIn}"
            };
        }
    }

    public class AwesomeApiRate
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("codein")]
        public string CodeIn { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("high")]
        public string High { get; set; } = "0";

        [JsonPropertyName("low")]
        public string Low { get; set; } = "0";

        [JsonPropertyName("varBid")]
        public string VarBid { get; set; } = "0";

        [JsonPropertyName("pctChange")]
        public string PctChange { get; set; } = "0";

        [JsonPropertyName("bid")]
        public string Bid { get; set; } = "0";

        [JsonPropertyName("ask")]
        public string Ask { get; set; } = "0";
    }
}
