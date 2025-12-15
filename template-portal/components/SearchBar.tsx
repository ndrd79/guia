/**
 * SearchBar Component - Template
 * 
 * Barra de pesquisa simples para o header
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                placeholder="O que você procura?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full py-3 px-4 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white w-9 h-9 rounded-full hover:bg-indigo-700 transition flex items-center justify-center"
                aria-label="Buscar"
            >
                <i className="fas fa-search"></i>
            </button>
        </form>
    );
};

export default SearchBar;
