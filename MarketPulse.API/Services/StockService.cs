using System.Text.Json;
using MarketPulse.API.Models;

namespace MarketPulse.API.Services
{
    public class StockService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public StockService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ApiKeys:AlphaVantage"]!;
        }

        public async Task<StockQuote?> GetQuoteAsync(string symbol)
        {
            var url = $"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            var json = JsonDocument.Parse(response);

            if (!json.RootElement.TryGetProperty("Global Quote", out var quote))
                return null;

            if (!quote.TryGetProperty("05. price", out _))
                return null;

            return new StockQuote
            {
                Symbol = quote.GetProperty("01. symbol").GetString() ?? symbol,
                Price = decimal.Parse(quote.GetProperty("05. price").GetString() ?? "0"),
                Change = decimal.Parse(quote.GetProperty("09. change").GetString() ?? "0"),
                ChangePercent = decimal.Parse(
                    (quote.GetProperty("10. change percent").GetString() ?? "0%").Replace("%", "")),
                High = decimal.Parse(quote.GetProperty("03. high").GetString() ?? "0"),
                Low = decimal.Parse(quote.GetProperty("04. low").GetString() ?? "0"),
                Volume = long.Parse(quote.GetProperty("06. volume").GetString() ?? "0"),
                LastUpdated = DateTime.UtcNow
            };
        }

        public async Task<List<StockQuote>> GetHistoricalAsync(string symbol)
        {
            var url = $"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&outputsize=compact&apikey={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            var json = JsonDocument.Parse(response);

            var result = new List<StockQuote>();

            if (!json.RootElement.TryGetProperty("Time Series (Daily)", out var timeSeries))
                return result;

            foreach (var day in timeSeries.EnumerateObject().Take(30))
            {
                var data = day.Value;
                result.Add(new StockQuote
                {
                    Symbol = symbol,
                    Price = decimal.Parse(data.GetProperty("4. close").GetString() ?? "0"),
                    High = decimal.Parse(data.GetProperty("2. high").GetString() ?? "0"),
                    Low = decimal.Parse(data.GetProperty("3. low").GetString() ?? "0"),
                    Volume = long.Parse(data.GetProperty("5. volume").GetString() ?? "0"),
                    LastUpdated = DateTime.Parse(day.Name)
                });
            }

            return result;
        }
    }
}