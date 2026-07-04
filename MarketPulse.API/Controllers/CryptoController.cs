using Microsoft.AspNetCore.Mvc;
using MarketPulse.API.Services;

namespace MarketPulse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CryptoController : ControllerBase
    {
        private readonly CryptoService _cryptoService;

        public CryptoController(CryptoService cryptoService)
        {
            _cryptoService = cryptoService;
        }

        // GET: api/crypto/top
        [HttpGet("top")]
        public async Task<IActionResult> GetTopCoins()
        {
            var coins = await _cryptoService.GetTopCoinsAsync();
            return Ok(coins);
        }

        // GET: api/crypto/{coinId}
        [HttpGet("{coinId}")]
        public async Task<IActionResult> GetCoin(string coinId)
        {
            var coin = await _cryptoService.GetQuoteAsync(coinId.ToLower());
            if (coin == null)
                return NotFound($"Kunde inte hitta krypto: {coinId}");
            return Ok(coin);
        }
    }
}