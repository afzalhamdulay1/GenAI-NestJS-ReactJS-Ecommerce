import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CircularProgress, Tooltip, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { Product } from "@/types";
import { api } from "@/services/api";
import { toast } from "react-toastify";

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
  const [visualLoading, setVisualLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedKeyword = useDebounce(keyword.trim(), 300);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setVisualLoading(true);
      setIsOpen(false);

      try {
        const { data } = await api.post("/ai/visual-search", { image: base64String });
        if (data.success && data.matchedProducts) {
          sessionStorage.setItem(
            "ai_visual_search",
            JSON.stringify({
              matchAnalysis: data.matchAnalysis,
              matchedProducts: data.matchedProducts,
            })
          );
          if (onSearchSubmit) onSearchSubmit();
          navigate("/products?visualSearch=true");
          toast.success("✨ Visual match found!");
        } else {
          toast.error("Could not find matching products for this photo");
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "AI Visual Search failed");
      } finally {
        setVisualLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

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
      {/* Keyframe animation definition for AI camera button */}
      <style>
        {`
          @keyframes aiCameraGlow {
            0% {
              box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.6), 0 0 8px rgba(236, 72, 153, 0.4);
            }
            50% {
              box-shadow: 0 0 12px 4px rgba(168, 85, 247, 0.8), 0 0 16px 6px rgba(236, 72, 153, 0.6);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.6), 0 0 8px rgba(236, 72, 153, 0.4);
            }
          }
          @keyframes aiSparkleRotate {
            0% { transform: rotate(0deg) scale(0.95); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(0.95); }
          }
        `}
      </style>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />
      {variant === "pill" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", flexWrap: "wrap" }}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(keyword.trim());
            }}
            className="productsSearchForm"
            style={{ flex: 1, minWidth: "280px" }}
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

          {/* Dedicated AI Image Search Button with Embedded Info Icon */}
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={visualLoading}
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              color: "#ffffff",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "0.85rem",
              animation: "aiCameraGlow 2.5s infinite ease-in-out",
              boxShadow: "0 4px 14px rgba(168, 85, 247, 0.35)",
              whiteSpace: "nowrap",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {visualLoading ? (
              <CircularProgress size={16} sx={{ color: "#ffffff" }} />
            ) : (
              <PhotoCameraIcon sx={{ fontSize: 18 }} />
            )}
            <span>AI Image Search</span>

            <Tooltip
              enterTouchDelay={0}
              title={
                <div style={{ padding: "4px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#ffffff", mb: 0.5 }}>
                    📷 How AI Image Search Works
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#f3e8ff", display: "block", lineHeight: 1.4 }}>
                    Upload or snap a photo of any fashion item, sneakers, or tech device. Google Gemini AI will analyze the photo and find matching items in our store!
                  </Typography>
                </div>
              }
              arrow
              placement="top"
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  (document.activeElement as HTMLElement)?.blur();
                  setInfoModalOpen(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.85,
                  padding: "4px",
                  cursor: "pointer",
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#ffffff", "&:hover": { opacity: 1 } }} />
              </span>
            </Tooltip>
          </button>
        </div>
      ) : (
        /* Search Input Box for Header */
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="relative flex items-center flex-1">
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
              placeholder="Search products..."
              className="w-full bg-white/20 text-white placeholder-white/70 pl-10 pr-10 py-2 rounded-full border border-white/30 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:border-white shadow-inner transition-all duration-200 text-sm"
            />
            {loading ? (
              <CircularProgress size={16} className="absolute right-3 text-white focus-within:text-gray-600" />
            ) : (
              keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setResults([]);
                  }}
                  className="absolute right-3 text-white/70 hover:text-white focus-within:text-gray-600"
                >
                  <ClearIcon className="w-4 h-4" />
                </button>
              )
            )}
          </div>

          {/* AI Image Search Header Button with Embedded Info Icon */}
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={visualLoading}
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
              border: "none",
              borderRadius: "9999px",
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#ffffff",
              fontSize: "0.78rem",
              fontWeight: 700,
              animation: "aiCameraGlow 2.5s infinite ease-in-out",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {visualLoading ? (
              <CircularProgress size={14} sx={{ color: "#ffffff" }} />
            ) : (
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
            )}
            <span>AI Search</span>

            <Tooltip
              enterTouchDelay={0}
              title={
                <div style={{ padding: "4px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#ffffff", mb: 0.5 }}>
                    📷 How AI Image Search Works
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#f3e8ff", display: "block", lineHeight: 1.4 }}>
                    Upload or snap a photo of any item. Gemini AI will match its visual features against our store products!
                  </Typography>
                </div>
              }
              arrow
              placement="bottom-end"
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  (document.activeElement as HTMLElement)?.blur();
                  setInfoModalOpen(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.85,
                  padding: "4px",
                  cursor: "pointer",
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 14, color: "#ffffff", "&:hover": { opacity: 1 } }} />
              </span>
            </Tooltip>
          </button>
        </div>
      )}

      {/* Mobile & Touch Info Dialog Modal */}
      <Dialog
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        disableRestoreFocus
        PaperProps={{
          sx: {
            borderRadius: "1.2rem",
            padding: "8px",
            maxWidth: "400px",
            background: "linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)",
            border: "1px solid #e9d5ff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#581c87",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            fontSize: "1.05rem",
            pb: 1,
            pt: 2.5,
            px: 3,
          }}
        >
          <PhotoCameraIcon sx={{ color: "#9333ea", fontSize: "1.3rem", flexShrink: 0 }} />
          <span>AI Image Search Guide</span>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#4c1d95", lineHeight: 1.6, fontWeight: 500 }}>
            Upload or take a photo of any fashion outfit, sneakers, or tech product using your phone camera or gallery.
          </Typography>
          <Typography variant="body2" sx={{ color: "#7e22ce", mt: 1.5, lineHeight: 1.6, fontWeight: 600 }}>
            ✨ Google Gemini AI will analyze the visual attributes (color, pattern, item type) and instantly find matching items in our store!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setInfoModalOpen(false)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
              color: "#ffffff",
              fontWeight: 700,
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

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
