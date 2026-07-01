import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

// Hook untuk ambil daftar makanan dari backend dengan filter kategori & search
export function useFoods({ category, search } = {}) {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 50 }
      if (category && category !== 'Semua') params.category = category
      if (search) params.search = search

      const res = await api.get('/foods', { params })
      setFoods(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat menu')
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    fetchFoods()
  }, [fetchFoods])

  return { foods, loading, error, refetch: fetchFoods }
}

// Hook untuk ambil best seller (dipakai di Home)
export function useBestSeller() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestSeller = async () => {
      try {
        const res = await api.get('/foods/best-seller')
        setFoods(res.data.data)
      } catch (err) {
        console.error('Gagal memuat best seller:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBestSeller()
  }, [])

  return { foods, loading }
}

// Hook untuk ambil 1 menu by id (dipakai di ProductDetail)
export function useFoodDetail(id) {
  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/foods/${id}`)
        setFood(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Menu tidak ditemukan')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id])

  return { food, loading, error }
}
