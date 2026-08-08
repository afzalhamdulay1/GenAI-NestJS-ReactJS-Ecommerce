import React, { useState, useEffect } from "react";
import { Paper, Box, Typography, Chip, CircularProgress, Button, IconButton, Tooltip } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { api } from "@/services/api";
import { toast } from "react-toastify";

interface ExecutiveInsights {
  executiveSummary: string;
  inventoryAlerts: string[];
  strategicRecommendations: string[];
}

const AIExecutiveBriefCard: React.FC = () => {
  const [insights, setInsights] = useState<ExecutiveInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ai/store-insights");
      if (data.success) {
        setInsights({
          executiveSummary: data.executiveSummary,
          inventoryAlerts: data.inventoryAlerts || [],
          strategicRecommendations: data.strategicRecommendations || [],
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load AI Store Brief");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        mb: 4,
        borderRadius: "1.2rem",
        background: "linear-gradient(135deg, #fdf4ff 0%, #faf5ff 50%, #f3e8ff 100%)",
        border: "1px solid #e9d5ff",
        boxShadow: "0 4px 24px rgba(168, 85, 247, 0.08)",
      }}
    >
      {/* Header Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#9333ea", fontSize: { xs: "1.3rem", sm: "1.6rem" } }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#581c87", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
            ✨ AI Executive Store Brief
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label="⚡ Gemini AI Powered"
            size="small"
            sx={{ bgcolor: "#7e22ce", color: "#ffffff", fontWeight: 700, fontSize: "0.72rem" }}
          />
          <Tooltip title="Refresh AI Store Insights">
            <IconButton
              size="small"
              onClick={fetchInsights}
              disabled={loading}
              sx={{ color: "#9333ea", "&:hover": { bgcolor: "rgba(147, 51, 234, 0.1)" } }}
            >
              <RefreshIcon fontSize="small" className={loading ? "animate-spin" : ""} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Card Content */}
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3, px: 1 }}>
          <CircularProgress size={22} sx={{ color: "#9333ea" }} />
          <Typography variant="body2" sx={{ color: "#7e22ce", fontWeight: 600 }}>
            Analyzing MongoDB orders, sales trends, and stock metrics...
          </Typography>
        </Box>
      ) : insights ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Executive Summary Statement */}
          <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.85)", borderRadius: "12px", border: "1px solid #f0abfc" }}>
            <Typography variant="caption" sx={{ color: "#86198f", fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5, mb: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <TrendingUpIcon sx={{ fontSize: "1rem", color: "#c026d3" }} /> Executive Overview
            </Typography>
            <Typography variant="body2" sx={{ color: "#4c0519", fontWeight: 600, fontSize: "0.92rem", lineHeight: 1.6 }}>
              {insights.executiveSummary}
            </Typography>
          </Box>

          {/* Grid for Inventory Warnings & Strategic Recommendations */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            {/* Inventory Alerts */}
            {insights.inventoryAlerts && insights.inventoryAlerts.length > 0 && (
              <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.85)", borderRadius: "12px", border: "1px solid #fecdd3" }}>
                <Typography variant="caption" sx={{ color: "#9f1239", fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5, mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <WarningAmberIcon sx={{ fontSize: "1rem", color: "#e11d48" }} /> Inventory & Stock Alerts
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                  {insights.inventoryAlerts.map((alert, i) => (
                    <Typography key={i} variant="body2" sx={{ color: "#881337", fontWeight: 500, fontSize: "0.86rem", display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <span style={{ color: "#f43f5e", fontWeight: 800 }}>•</span> {alert}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* Strategic Recommendations */}
            {insights.strategicRecommendations && insights.strategicRecommendations.length > 0 && (
              <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.85)", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                <Typography variant="caption" sx={{ color: "#14532d", fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5, mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <LightbulbOutlinedIcon sx={{ fontSize: "1rem", color: "#16a34a" }} /> Strategic Action Plan
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                  {insights.strategicRecommendations.map((tip, i) => (
                    <Typography key={i} variant="body2" sx={{ color: "#14532d", fontWeight: 500, fontSize: "0.86rem", display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <span style={{ color: "#22c55e", fontWeight: 800 }}>•</span> {tip}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
};

export default AIExecutiveBriefCard;
