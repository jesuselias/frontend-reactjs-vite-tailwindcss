import { useState, useEffect } from "react";
import axios from "axios";

const usePokemonList = (page = 1, limit = 12) => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPokemons = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
        );
        setPokemons(response.data.results);
        setTotal(response.data.count);
      } catch (error) {
        console.error("Error fetching Pokémon list:", error);
      }
      setLoading(false);
    };

    fetchPokemons();
  }, [page, limit]);

  return { pokemons, loading, total };
};

export default usePokemonList;
