import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CACHE_KEY = "pokemon_list_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const usePokemonList = (page = 1, limit = 12, filter = '') => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const API_URL = 'https://pokeapi.co/api/v2/pokemon';

  // Caché en localStorage
  const getCachedData = useCallback((currentPage, currentLimit) => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cache = JSON.parse(cached);
    const { data, page: cachedPage, limit: cachedLimit, timestamp } = cache;
    
    if (cachedPage === currentPage && 
        cachedLimit === currentLimit && 
        Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    return null;
  }, []);

  // Persistencia en caché
  const cacheData = useCallback((data, currentPage, currentLimit) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      page: currentPage,
      limit: currentLimit,
      timestamp: Date.now()
    }));
  }, []);

  const fetchPokemons = useCallback(async () => {
    const cachedData = getCachedData(page, limit);
    if (cachedData) {
      setPokemons(cachedData.results);
      setTotal(cachedData.count);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?offset=${(page - 1) * limit}&limit=${limit}`
      );
      
      setPokemons(response.data.results);
      setTotal(response.data.count);
      cacheData(response.data, page, limit);
    } catch (error) {
      setError(error.message || "Error al obtener la lista de Pokémon");
      console.error("Error fetching pokemons:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, getCachedData, cacheData]);

  useEffect(() => {
    fetchPokemons();
  }, [fetchPokemons]);

  return { pokemons, loading, total, error };
};