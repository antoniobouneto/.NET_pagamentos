using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    public class CurrencyHub : Hub
    {
        private readonly IRedisCacheService _cacheService;
        private readonly ILogger<CurrencyHub> _logger;

        public CurrencyHub(IRedisCacheService cacheService, ILogger<CurrencyHub> logger)
        {
            _cacheService = cacheService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected to CurrencyHub: {ConnectionId}", Context.ConnectionId);

            // Send initial snapshot of all rates to newly connected client
            var rates = await _cacheService.GetAllRatesAsync();
            await Clients.Caller.SendAsync("ReceiveInitialRates", rates);

            await base.OnConnectedAsync();
        }

        public async Task RequestLatestRates()
        {
            var rates = await _cacheService.GetAllRatesAsync();
            await Clients.Caller.SendAsync("ReceiveInitialRates", rates);
        }
    }
}
