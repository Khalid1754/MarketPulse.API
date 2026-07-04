namespace MarketPulse.API.Models
{
    public class NewsArticle
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public DateTime PublishedAt { get; set; }
        public string Sentiment { get; set; } = string.Empty;
        public double SentimentScore { get; set; }
    }
}