using System.Text.Json;
using MarketPulse.API.Models;

namespace MarketPulse.API.Services
{
    public class CryptoService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public CryptoService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ApiKeys:CoinGecko"]!;
        }

        public async Task<CryptoQuote?> GetQuoteAsync(string coinId)
        {
            var url = $"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={coinId}&x_cg_demo_api_key={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            var json = JsonDocument.Parse(response);

            var coins = json.RootElement.EnumerateArray().ToList();
            if (coins.Count == 0) return null;

            var coin = coins[0];
            return new CryptoQuote
            {
                Id = coin.GetProperty("id").GetString() ?? coinId,
                Symbol = coin.GetProperty("symbol").GetString() ?? "",
                Name = coin.GetProperty("name").GetString() ?? "",
                CurrentPrice = coin.GetProperty("current_price").GetDecimal(),
                PriceChangePercent24h = coin.GetProperty("price_change_percentage_24h").GetDecimal(),
                MarketCap = coin.GetProperty("market_cap").GetDecimal(),
                TotalVolume = coin.GetProperty("total_volume").GetDecimal(),
                High24h = coin.GetProperty("high_24h").GetDecimal(),
                Low24h = coin.GetProperty("low_24h").GetDecimal()
            };
        }

        public async Task<List<CryptoQuote>> GetTopCoinsAsync()
        {
            var url = $"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&x_cg_demo_api_key={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            var json = JsonDocument.Parse(response);

            var result = new List<CryptoQuote>();
            foreach (var coin in json.RootElement.EnumerateArray())
            {
                result.Add(new CryptoQuote
                {
                    Id = coin.GetProperty("id").GetString() ?? "",
                    Symbol = coin.GetProperty("symbol").GetString() ?? "",
                    Name = coin.GetProperty("name").GetString() ?? "",
                    CurrentPrice = coin.GetProperty("current_price").GetDecimal(),
                    PriceChangePercent24h = coin.GetProperty("price_change_percentage_24h").GetDecimal(),
                    MarketCap = coin.GetProperty("market_cap").GetDecimal(),
                    TotalVolume = coin.GetProperty("total_volume").GetDecimal(),
                    High24h = coin.GetProperty("high_24h").GetDecimal(),
                    Low24h = coin.GetProperty("low_24h").GetDecimal()
                });
            }
            return result;
        }
    }
}