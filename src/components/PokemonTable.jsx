import React, { useState, useEffect } from "react";
import { usePokemonList } from '../hooks/usePokemonList';
import axios from "axios";

const PokemonTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const { pokemons, loading, total } = usePokemonList(page, 12, search);
  const [pokemonCountByLetter, setPokemonCountByLetter] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const countPokemonsByLetter = () => {
      const counts = {};
      pokemons.forEach((pokemon) => {
        const firstLetter = pokemon.name.charAt(0).toUpperCase();
        counts[firstLetter] = (counts[firstLetter] || 0) + 1;
      });
      setPokemonCountByLetter(counts);
    };

    if (pokemons.length > 0) {
      countPokemonsByLetter();
    }
  }, [pokemons]);

  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePokemonClick = async (pokemon) => {
    const response = await axios.get(pokemon.url);
    setSelectedPokemon(response.data);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (name) => {
    setSearch(name);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Pokedex</h1>
      <div className="flex flex-col md:flex-row min-h-[calc(70vh-2rem)] w-full max-w-7xl mx-auto bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        
        {/* Panel izquierdo - Tabla */}
        <div className="flex flex-col w-full md:w-1/2 p-4 border-r border-gray-800 relative">
          <h2 className="text-3xl font-bold mb-4 text-center text-white">Listado de Pokémon</h2>
          
          {/* Búsqueda con Autocompletador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar Pokémon..."
              className="border border-gray-300 p-2 mb-4 w-full rounded text-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={search}
              onChange={handleSearchChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && search && (
              <ul className="absolute w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {filteredPokemons.slice(0, 5).map((pokemon) => (
                  <li
                    key={pokemon.name}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSuggestionClick(pokemon.name)}
                  >
                    {pokemon.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {loading ? (
            <p className="text-center text-gray-400">Cargando...</p>
          ) : (
            <>
              <table className="w-full border-collapse border border-gray-600 mb-4">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="border border-gray-600 p-2 text-white">Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPokemons.map((pokemon) => (
                    <tr
                      key={pokemon.name}
                      className="border border-gray-600 cursor-pointer hover:bg-gray-800"
                      onClick={() => handlePokemonClick(pokemon)}
                    >
                      <td className="p-2 text-gray-300">{pokemon.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="flex justify-between mt-auto pt-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <span className="text-white">Página {page}</span>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => setPage(page + 1)}
                  disabled={page * 20 >= total}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>

        {/* Panel derecho - Detalles y resumen */}
        <div className="flex flex-col w-full md:w-1/2 p-4">
        <h2 className="text-xl font-bold mb-2 mt-4 text-center text-white">Detalle</h2>
        {selectedPokemon && (
          <div className="border rounded p-4 mb-4 shadow-md bg-gray-800 flex-grow text-center">
            <h2 className="text-xl font-bold mb-2 text-green-400">{selectedPokemon.name}</h2>
            
            {/* Imagen del Pokémon */}
            {selectedPokemon.sprites?.front_default && (
              <img
                src={selectedPokemon.sprites.front_default}
                alt={selectedPokemon.name}
                className="mx-auto mb-4 w-32 h-32"
              />
            )}
            
            <p className="text-gray-300">Peso: {selectedPokemon.weight} kg</p>
            <p className="text-gray-300">
              Tipo: {selectedPokemon.types.map((t) => t.type.name).join(", ")}
            </p>
          </div>
        )}

          {/* Resumen por letra */}
          <div className="mt-auto">
            <h2 className="text-xl font-bold mb-2 mt-4 text-center text-white">Resumen por letra</h2>
            <table className="w-full border-collapse border border-gray-600">
              <thead>
                <tr className="bg-gray-700">
                  <th className="border border-gray-600 p-2 text-white">Letra</th>
                  <th className="border border-gray-600 p-2 text-white">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pokemonCountByLetter).map(([letter, count]) => (
                  <tr key={letter} className="border border-gray-600">
                     <td className="border border-gray-600 p-2 text-gray-300 text-center">{letter}</td>
                     <td className="border border-gray-600 p-2 text-gray-300 text-center">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonTable;
