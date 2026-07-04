using Microsoft.AspNetCore.Mvc;
using MarketPulse.API.Services;

namespace MarketPulse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly NewsService _newsService;

        public NewsController(NewsService newsService)
        {
            _newsService = newsService;
        }

        // GET: api/news/{query}
        [HttpGet("{query}")]
        public async Task<IActionResult> GetNews(string query)
        {
            var articles = await _newsService.GetNewsAsync(query);
            return Ok(articles);
        }
    }
}