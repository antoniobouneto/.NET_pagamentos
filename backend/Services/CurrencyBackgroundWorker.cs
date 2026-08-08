using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services
{
    public class CurrencyBackgroundWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<CurrencyHub> _hubContext;
        private readonly ILogger<CurrencyBackgroundWorker> _logger;

        public CurrencyBackgroundWorker(
            IServiceProvider serviceProvider,
            IHubContext<CurrencyHub> hubContext,
            ILogger<CurrencyBackgroundWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("⏳ Currency Background Worker started.");

            // Initial fetch
            using (var scope = _serviceProvider.CreateScope())
            {
                var currencyService = scope.ServiceProvider.GetRequiredService<CurrencyService>();
                await currencyService.RefreshRatesFromApiAsync();
            }

            int tickCounter = 0;
            var pairs = new[] { "USD/BRL", "EUR/BRL", "EUR/USD", "GBP/BRL", "BTC/BRL" };

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var currencyService = scope.ServiceProvider.GetRequiredService<CurrencyService>();

                        // Every 30 seconds (15 ticks * 2s), refresh from live API
                        if (tickCounter % 15 == 0)
                        {
                            await currencyService.RefreshRatesFromApiAsync();
                        }
                        else
                        {
                            // Micro tick updates for live ticker feel
                            string pairToUpdate = pairs[tickCounter % pairs.Length];
                            var updatedRate = await currencyService.SimulateMicroTickAsync(pairToUpdate);

                            // Broadcast live update over SignalR to all connected frontend clients
                            await _hubContext.Clients.All.SendAsync("ReceiveRateUpdate", updatedRate, stoppingToken);
                        }
                    }

                    tickCounter++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Currency Background Worker loop");
                }

                await Task.Delay(2000, stoppingToken);
            }
        }
    }
}
