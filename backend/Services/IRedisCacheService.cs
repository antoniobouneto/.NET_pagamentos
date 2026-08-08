using Backend.Models;

namespace Backend.Services
{
    public interface IRedisCacheService
    {
        Task SetRateAsync(CurrencyRate rate);
        Task<CurrencyRate?> GetRateAsync(string pair);
        Task<List<CurrencyRate>> GetAllRatesAsync();
        Task PublishRateUpdateAsync(CurrencyRate rate);
        bool IsRedisConnected { get; }
    }
}
