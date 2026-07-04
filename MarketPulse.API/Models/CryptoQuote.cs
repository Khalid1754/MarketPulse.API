namespace MarketPulse.API.Models
{
    public class CryptoQuote
    {
        public string Id { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
        public decimal PriceChangePercent24h { get; set; }
        public decimal MarketCap { get; set; }
        public decimal TotalVolume { get; set; }
        public decimal High24h { get; set; }
        public decimal Low24h { get; set; }
    }
}