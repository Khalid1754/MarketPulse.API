using Microsoft.AspNetCore.Mvc;
using MarketPulse.API.Services;

namespace MarketPulse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : ControllerBase
    {
        private readonly StockService _stockService;

        public StockController(StockService stockService)
        {
            _stockService = stockService;
        }

        // GET: api/stock/{symbol}
        [HttpGet("{symbol}")]
        public async Task<IActionResult> GetQuote(string symbol)
        {
            var quote = await _stockService.GetQuoteAsync(symbol.ToUpper());
            if (quote == null)
                return NotFound($"Kunde inte hitta aktie: {symbol}");
            return Ok(quote);
        }

        // GET: api/stock/{symbol}/history
        [HttpGet("{symbol}/history")]
        public async Task<IActionResult> GetHistory(string symbol)
        {
            var history = await _stockService.GetHistoricalAsync(symbol.ToUpper());
            if (history.Count == 0)
                return NotFound($"Ingen historik hittades för: {symbol}");
            return Ok(history);
        }
    }
}