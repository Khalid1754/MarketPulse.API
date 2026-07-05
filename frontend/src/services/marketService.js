import api from './api'

export const getStockQuote = (symbol) => api.get(`/stock/${symbol}`).then(r => r.data)
export const getStockHistory = (symbol) => api.get(`/stock/${symbol}/history`).then(r => r.data)
export const getCryptoQuote = (coinId) => api.get(`/crypto/${coinId}`).then(r => r.data)
export const getTopCryptos = () => api.get('/crypto/top').then(r => r.data)
export const getNews = (query) => api.get(`/news/${query}`).then(r => r.data)