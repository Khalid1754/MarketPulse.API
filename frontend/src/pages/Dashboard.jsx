import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTopCryptos, getStockQuote } from '../services/marketService'

const POPULAR_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN']

function PriceChange({ value }) {
  const positive = value >= 0
  return (
    <span className={`font-mono text-sm font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  )
}

function Dashboard() {
  const [cryptos, setCryptos] = useState([])
  const [stocks, setStocks] = useState([])
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchType, setSearchType] = useState('stock')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getTopCryptos(),
      Promise.all(POPULAR_STOCKS.map(s => getStockQuote(s).catch(() => null)))
    ]).then(([cryptoData, stockData]) => {
      setCryptos(cryptoData)
      setStocks(stockData.filter(Boolean))
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setSearching(true)
    setSearchError(null)
    setSearchResult(null)

    try {
      const { getStockQuote, getCryptoQuote } = await import('../services/marketService')
      const result = searchType === 'stock'
        ? await getStockQuote(search.toUpperCase())
        : await getCryptoQuote(search.toLowerCase())
      setSearchResult({ ...result, type: searchType })
    } catch {
      setSearchError('Hittade inget — kontrollera symbolen och försök igen.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#E2E8F0]">
      {/* Header */}
      <header className="border-b border-[#1E2433] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-display font-bold text-lg tracking-tight">MARKETPULSE</span>
        </div>
        <span className="text-[#94A3B8] text-xs font-mono">
          {new Date().toLocaleTimeString('sv-SE')} · LIVE
        </span>
      </header>

      <main className="px-8 py-8 max-w-7xl mx-auto">
        {/* Söksektion */}
        <div className="mb-10">
          <p className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Sök tillgång
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-6">
            Vad vill du analysera?
          </h1>

          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex bg-[#141925] border border-[#1E2433] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setSearchType('stock')}
                className={`px-4 py-2.5 text-sm font-medium transition ${
                  searchType === 'stock'
                    ? 'bg-emerald-400 text-[#0A0A0F]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Aktie
              </button>
              <button
                type="button"
                onClick={() => setSearchType('crypto')}
                className={`px-4 py-2.5 text-sm font-medium transition ${
                  searchType === 'crypto'
                    ? 'bg-emerald-400 text-[#0A0A0F]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Krypto
              </button>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchType === 'stock' ? 'T.ex. AAPL, TSLA, MSFT...' : 'T.ex. bitcoin, ethereum...'}
              className="flex-1 bg-[#141925] border border-[#1E2433] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition placeholder-[#94A3B8]"
            />

            <button
              type="submit"
              disabled={searching}
              className="bg-emerald-400 text-[#0A0A0F] font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-emerald-300 transition disabled:opacity-50"
            >
              {searching ? 'Söker...' : 'Sök'}
            </button>
          </form>

          {searchError && <p className="text-red-400 text-sm">{searchError}</p>}

          {searchResult && (
            <div
              onClick={() => navigate(`/asset/${searchResult.type}/${searchResult.symbol || searchResult.id}`)}
              className="bg-[#141925] border border-emerald-400/30 rounded-lg p-5 cursor-pointer hover:border-emerald-400 transition max-w-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-lg">
                    {searchResult.name || searchResult.symbol}
                  </p>
                  <p className="text-[#94A3B8] text-xs mt-1">Klicka för fullständig analys →</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xl">
                    ${(searchResult.price || searchResult.currentPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <PriceChange value={searchResult.changePercent || searchResult.priceChangePercent24h || 0} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topp Krypto */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#94A3B8]">
                Topp Krypto
              </h2>
              <span className="text-xs text-[#94A3B8]">Market cap</span>
            </div>

            <div className="bg-[#141925] border border-[#1E2433] rounded-lg overflow-hidden">
              {loading && <p className="px-5 py-4 text-[#94A3B8] text-sm">Hämtar data...</p>}
              {cryptos.map((coin, i) => (
                <div
                  key={coin.id}
                  onClick={() => navigate(`/asset/crypto/${coin.id}`)}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E2433] last:border-0 hover:bg-[#1A2030] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#94A3B8] text-xs font-mono w-5">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{coin.name}</p>
                      <p className="text-[#94A3B8] text-xs uppercase">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">
                      ${coin.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <PriceChange value={coin.priceChangePercent24h} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Populära Aktier */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#94A3B8]">
                Populära Aktier
              </h2>
              <span className="text-xs text-[#94A3B8]">Senaste pris</span>
            </div>

            <div className="bg-[#141925] border border-[#1E2433] rounded-lg overflow-hidden">
              {loading && <p className="px-5 py-4 text-[#94A3B8] text-sm">Hämtar data...</p>}
              {stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => navigate(`/asset/stock/${stock.symbol}`)}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E2433] last:border-0 hover:bg-[#1A2030] transition cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-sm">{stock.symbol}</p>
                    <p className="text-[#94A3B8] text-xs">NYSE / NASDAQ</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">
                      ${Number(stock.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <PriceChange value={Number(stock.changePercent)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard