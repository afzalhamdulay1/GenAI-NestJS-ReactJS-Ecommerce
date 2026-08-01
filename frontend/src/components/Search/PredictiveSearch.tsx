import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgress from "@mui/material/CircularProgress";
import { Product } from "@/types";

// In-memory cache for debounced predictive search queries
const searchCache = new Map<string, Product[]>();

interface PredictiveSearchProps {
  onSearchSubmit?: () => void;
  variant?: "header" | "pill";
  initialKeyword?: string;
}

const PredictiveSearch: React.FC<PredictiveSearchProps> = ({ 
  onSearchSubmit, 
  variant = "header",
  initialKeyword = ""
}) => {
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    if (initialKeyword) setKeyword(initialKeyword);
  }, [initialKeyword]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedKeyword = useDebounce(keyword.trim(), 300);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch predictive search results with caching
  useEffect(() => {
    if (debouncedKeyword.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Check in-memory cache first
    if (searchCache.has(debouncedKeyword.toLowerCase())) {
      setResults(searchCache.get(debouncedKeyword.toLowerCase()) || []);
      if (document.activeElement === inputRef.current) {
        setIsOpen(true);
      }
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchResults = async () => {
      try {
        const backendUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:4000"
            : window.location.origin;

        const res = await fetch(
          `${backendUrl}/api/v1/products?keyword=${encodeURIComponent(debouncedKeyword)}&resultPerPage=6`
        );
        const data = await res.json();

        if (isMounted && data.success) {
          const fetchedProducts = data.products || [];
          searchCache.set(debouncedKeyword.toLowerCase(), fetchedProducts);
          setResults(fetchedProducts);
          if (document.activeElement === inputRef.current) {
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Predictive search fetch error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [debouncedKeyword]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && keyword.trim()) {
        e.preventDefault();
        submitSearch(keyword.trim());
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleProductClick(results[selectedIndex]._id);
      } else {
        submitSearch(keyword.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const submitSearch = (query: string) => {
    if (query) {
      setIsOpen(false);
      if (onSearchSubmit) onSearchSubmit();
      navigate(`/products/${encodeURIComponent(query)}`);
    } else {
      navigate('/products');
    }
  };

  const handleProductClick = (id: string) => {
    setIsOpen(false);
    setKeyword("");
    if (onSearchSubmit) onSearchSubmit();
    navigate(`/product/${id}`);
  };

  return (
    <div ref={searchRef} className={`relative w-full ${variant === "pill" ? "max-w-3xl" : "max-w-md"}`}>
      {variant === "pill" ? (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(keyword.trim());
          }}
          className="productsSearchForm"
        >
          <SearchIcon sx={{ color: '#0284c7', fontSize: 24, ml: 0.5 }} />
          <input
            ref={inputRef}
            type="text"
            className="productsSearchInput"
            placeholder="Search products by name, category, or keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
          {loading ? (
            <CircularProgress size={18} sx={{ color: '#0284c7', mr: 1 }} />
          ) : (
            keyword && (
              <button
                type="button"
                className="clearSearchBtn"
                onClick={() => {
                  setKeyword("");
                  setResults([]);
                  setIsOpen(false);
                  navigate('/products');
                }}
                title="Clear Search"
              >
                <ClearIcon fontSize="small" />
              </button>
            )
          )}
          <button type="submit" className="searchSubmitBtn">
            <span>Search</span>
          </button>
        </form>
      ) : (
        /* Search Input Box for Header */
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3 text-white/70 w-5 h-5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search products, categories..."
            className="w-full bg-white/20 text-white placeholder-white/70 pl-10 pr-10 py-2 rounded-full border border-white/30 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:border-white shadow-inner transition-all duration-200 text-sm"
          />
          <div className="absolute right-3 flex items-center">
            {loading ? (
              <CircularProgress size={16} className="text-white focus-within:text-gray-600" />
            ) : (
              keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setResults([]);
                    setIsOpen(false);
                  }}
                  className="text-white/70 hover:text-white focus-within:text-gray-600"
                >
                  <ClearIcon className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Auto-Suggest Floating Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Product Suggestions ({results.length})
              </div>

              {results.map((product, idx) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 cursor-pointer transition-colors ${
                    selectedIndex === idx ? "bg-red-50" : "hover:bg-gray-50"
                  }`}
                >
                  <img
                    src={product.images?.[0]?.url || "/Profile.png"}
                    alt={product.name}
                    className="w-11 h-11 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {product.category || "General"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">
                      ₹{product.price}
                    </p>
                    {product.stock && product.stock > 0 ? (
                      <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* View All Button */}
              <div
                onClick={() => submitSearch(keyword.trim())}
                className="px-4 py-2.5 bg-gray-50 hover:bg-red-50 text-center border-t border-gray-100 cursor-pointer text-xs font-semibold text-red-500 transition-colors"
              >
                View all results for "{keyword.trim()}" →
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 text-sm">
              No products found matching "<span className="font-semibold text-gray-700">{keyword}</span>"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictiveSearch;
