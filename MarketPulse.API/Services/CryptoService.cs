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
                Id = coin.GetProperty("id").GetString() ?? "",
                Symbol = coin.GetProperty("symbol").GetString() ?? "",
                Name = coin.GetProperty("name").GetString() ?? "",
                CurrentPrice = coin.TryGetProperty("current_price", out var cp) && cp.ValueKind != JsonValueKind.Null ? cp.GetDecimal() : 0,
                PriceChangePercent24h = coin.TryGetProperty("price_change_percentage_24h", out var pcp) && pcp.ValueKind != JsonValueKind.Null ? pcp.GetDecimal() : 0,
                MarketCap = coin.TryGetProperty("market_cap", out var mc) && mc.ValueKind != JsonValueKind.Null ? mc.GetDecimal() : 0,
                TotalVolume = coin.TryGetProperty("total_volume", out var tv) && tv.ValueKind != JsonValueKind.Null ? tv.GetDecimal() : 0,
                High24h = coin.TryGetProperty("high_24h", out var h) && h.ValueKind != JsonValueKind.Null ? h.GetDecimal() : 0,
                Low24h = coin.TryGetProperty("low_24h", out var l) && l.ValueKind != JsonValueKind.Null ? l.GetDecimal() : 0
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
                    CurrentPrice = coin.TryGetProperty("current_price", out var cp) && cp.ValueKind != JsonValueKind.Null ? cp.GetDecimal() : 0,
                    PriceChangePercent24h = coin.TryGetProperty("price_change_percentage_24h", out var pcp) && pcp.ValueKind != JsonValueKind.Null ? pcp.GetDecimal() : 0,
                    MarketCap = coin.TryGetProperty("market_cap", out var mc) && mc.ValueKind != JsonValueKind.Null ? mc.GetDecimal() : 0,
                    TotalVolume = coin.TryGetProperty("total_volume", out var tv) && tv.ValueKind != JsonValueKind.Null ? tv.GetDecimal() : 0,
                    High24h = coin.TryGetProperty("high_24h", out var h) && h.ValueKind != JsonValueKind.Null ? h.GetDecimal() : 0,
                    Low24h = coin.TryGetProperty("low_24h", out var l) && l.ValueKind != JsonValueKind.Null ? l.GetDecimal() : 0
                });
            }
            return result;
        }
    }
}