using System.Text.Json;
using MarketPulse.API.Models;

namespace MarketPulse.API.Services
{
    public class NewsService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public NewsService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ApiKeys:GNews"]!;
        }

        public async Task<List<NewsArticle>> GetNewsAsync(string query)
        {
            var url = $"https://gnews.io/api/v4/search?q={query}&lang=en&max=10&apikey={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            var json = JsonDocument.Parse(response);

            var result = new List<NewsArticle>();

            if (!json.RootElement.TryGetProperty("articles", out var articles))
                return result;

            foreach (var article in articles.EnumerateArray())
            {
                var title = article.GetProperty("title").GetString() ?? "";
                var description = article.TryGetProperty("description", out var desc)
                    ? desc.GetString() ?? ""
                    : "";

                var (sentiment, score) = AnalyzeSentiment(title + " " + description);

                result.Add(new NewsArticle
                {
                    Title = title,
                    Description = description,
                    Url = article.GetProperty("url").GetString() ?? "",
                    Source = article.GetProperty("source").GetProperty("name").GetString() ?? "",
                    PublishedAt = article.GetProperty("publishedAt").GetDateTime(),
                    Sentiment = sentiment,
                    SentimentScore = score
                });
            }

            return result;
        }

        private (string sentiment, double score) AnalyzeSentiment(string text)
        {
            var positiveWords = new[] {
                "surge", "rally", "gain", "profit", "growth", "bull", "record",
                "high", "rise", "up", "strong", "beat", "exceed", "positive",
                "boom", "soar", "jump", "increase", "success", "win"
            };
            var negativeWords = new[] {
                "crash", "drop", "fall", "loss", "bear", "decline", "down",
                "weak", "miss", "negative", "bust", "plunge", "slump", "fear",
                "risk", "sell", "cut", "warn", "concern", "trouble"
            };

            var lowerText = text.ToLower();
            var positiveCount = positiveWords.Count(w => lowerText.Contains(w));
            var negativeCount = negativeWords.Count(w => lowerText.Contains(w));

            var total = positiveCount + negativeCount;
            if (total == 0) return ("Neutral", 0.5);

            var score = (double)positiveCount / total;
            var sentiment = score > 0.6 ? "Positive" : score < 0.4 ? "Negative" : "Neutral";
            return (sentiment, score);
        }
    }
}