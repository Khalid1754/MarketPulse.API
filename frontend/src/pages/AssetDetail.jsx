import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getStockQuote, getStockHistory, getCryptoQuote, getNews } from '../services/marketService'

function SentimentMeter({ score }) {
  const percentage = Math.round(score * 100)
  const color = score > 0.6 ? '#34d399' : score < 0.4 ? '#f87171' : '#fbbf24'
  const label = score > 0.6 ? 'Positiv' : score < 0.4 ? 'Negativ' : 'Neutral'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#94A3B8] text-xs uppercase tracking-wide">Sentiment</span>
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="h-2 bg-[#1E2433] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[#94A3B8] text-xs">Negativ</span>
        <span className="text-[#94A3B8] text-xs">Positiv</span>
      </div>
    </div>
  )
}

function SentimentBadge({ sentiment }) {
  const colors = {
    Positive: 'bg-emerald-400/10 text-emerald-400',
    Negative: 'bg-red-400/10 text-red-400',
    Neutral: 'bg-yellow-400/10 text-yellow-400',
  }
  const labels = { Positive: 'Positiv', Negative: 'Negativ', Neutral: 'Neutral' }
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded ${colors[sentiment] || colors.Neutral}`}>
      {labels[sentiment] || sentiment}
    </span>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#141925] border border-[#1E2433] rounded-lg px-3 py-2 text-sm">
      <p className="text-[#94A3B8] text-xs mb-1">{label}</p>
      <p className="font-mono font-bold text-emerald-400">
        ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}

function AssetDetail() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [history, setHistory] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const assetPromise = type === 'stock'
      ? getStockQuote(id)
      : getCryptoQuote(id)

    const historyPromise = type === 'stock'
      ? getStockHistory(id)
      : Promise.resolve([])

    const newsPromise = getNews(id)

    Promise.all([assetPromise, historyPromise, newsPromise])
      .then(([assetData, historyData, newsData]) => {
        setAsset(assetData)
        setHistory(historyData.reverse().map(h => ({
          date: new Date(h.lastUpdated).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
          price: Number(h.price)
        })))
        setNews(newsData)
      })
      .catch(() => setError('Kunde inte hämta data.'))
      .finally(() => setLoading(false))
  }, [type, id])

  const price = asset?.price || asset?.currentPrice || 0
  const change = asset?.changePercent || asset?.priceChangePercent24h || 0
  const isPositive = change >= 0

  const avgSentiment = news.length > 0
    ? news.reduce((sum, n) => sum + n.sentimentScore, 0) / news.length
    : 0.5

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mx-auto mb-3" />
        <p className="text-[#94A3B8] text-sm">Hämtar marknadsdata...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#E2E8F0]">
      {/* Header */}
      <header className="border-b border-[#1E2433] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-display font-bold text-lg tracking-tight">MARKETPULSE</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-[#94A3B8] text-sm hover:text-white transition"
        >
          ← Tillbaka
        </button>
      </header>

      <main className="px-8 py-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[#94A3B8] text-xs uppercase tracking-wide mb-1">
              {type === 'stock' ? 'Aktie' : 'Kryptovaluta'}
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-1">
              {asset?.name || asset?.symbol || id.toUpperCase()}
            </h1>
            <p className="text-[#94A3B8] text-sm uppercase">{asset?.symbol || id}</p>
          </div>

          <div className="text-right">
            <p className="font-mono text-4xl font-bold mb-1">
              ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className={`font-mono text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Kursgraf */}
          <div className="lg:col-span-2 bg-[#141925] border border-[#1E2433] rounded-lg p-5">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#94A3B8] mb-4">
              {type === 'stock' ? '30 dagars kursutveckling' : 'Prisutveckling'}
            </h2>

            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2433" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#34d399' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-[#94A3B8] text-sm">
                Kursgraf ej tillgänglig för krypto just nu
              </div>
            )}
          </div>

          {/* Nyckeltal + Sentiment */}
          <div className="space-y-4">
            {/* Nyckeltal */}
            <div className="bg-[#141925] border border-[#1E2433] rounded-lg p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#94A3B8] mb-4">
                Nyckeltal
              </h2>
              <div className="space-y-3">
                {type === 'stock' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">Dagshög</span>
                      <span className="font-mono text-sm">${Number(asset?.high || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">Dagsläg</span>
                      <span className="font-mono text-sm">${Number(asset?.low || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">Volym</span>
                      <span className="font-mono text-sm">{Number(asset?.volume || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">Förändring</span>
                      <span className={`font-mono text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{Number(asset?.change || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">Market Cap</span>
                      <span className="font-mono text-sm">${(Number(asset?.marketCap || 0) / 1e9).toFixed(2)}B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">24h Hög</span>
                      <span className="font-mono text-sm">${Number(asset?.high24h || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">24h Låg</span>
                      <span className="font-mono text-sm">${Number(asset?.low24h || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8] text-xs">Volym 24h</span>
                      <span className="font-mono text-sm">${(Number(asset?.totalVolume || 0) / 1e9).toFixed(2)}B</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sentiment-meter */}
            <div className="bg-[#141925] border border-[#1E2433] rounded-lg p-5">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#94A3B8] mb-4">
                Nyhetssentiment
              </h2>
              <SentimentMeter score={avgSentiment} />
              <p className="text-[#94A3B8] text-xs mt-3">
                Baserat på {news.length} nyhetsartiklar
              </p>
            </div>
          </div>
        </div>

        {/* Nyhetsflöde */}
        <div className="bg-[#141925] border border-[#1E2433] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1E2433]">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wide">
              Senaste nyheter
            </h2>
          </div>

          {news.length === 0 && (
            <p className="px-5 py-4 text-[#94A3B8] text-sm">Inga nyheter hittades.</p>
          )}

          {news.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-4 border-b border-[#1E2433] last:border-0 hover:bg-[#1A2030] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 leading-snug">{article.title}</p>
                  <p className="text-[#94A3B8] text-xs line-clamp-2">{article.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[#94A3B8] text-xs">{article.source}</span>
                    <span className="text-[#1E2433]">·</span>
                    <span className="text-[#94A3B8] text-xs">
                      {new Date(article.publishedAt).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                </div>
                <SentimentBadge sentiment={article.sentiment} />
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AssetDetail