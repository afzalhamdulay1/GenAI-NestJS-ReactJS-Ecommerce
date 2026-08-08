import React, { useState } from "react";
import { Paper, Box, Typography, TextField, Button, Chip, CircularProgress } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import SendIcon from "@mui/icons-material/Send";
import { api } from "@/services/api";
import { toast } from "react-toastify";

interface AIProductQASectionProps {
  productId: string;
  productName: string;
}

interface QAResponse {
  question: string;
  answer: string;
}

const SUGGESTED_QUESTIONS = [
  "Is this item true to size?",
  "What is included in the box?",
  "Is there a warranty or return guarantee?",
  "What are the care or washing instructions?",
];

const AIProductQASection: React.FC<AIProductQASectionProps> = ({ productId, productName }) => {
  const [questionInput, setQuestionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAResponse[]>([]);

  const handleAskQuestion = async (qText?: string) => {
    const targetQuestion = (qText || questionInput).trim();
    if (!targetQuestion) {
      toast.info("Please enter a question!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/ai/product-qa", {
        productId,
        question: targetQuestion,
      });

      if (data.success && data.answer) {
        setQaHistory((prev) => [
          { question: targetQuestion, answer: data.answer },
          ...prev,
        ]);
        setQuestionInput("");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to get AI Q&A response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", mx: "auto", px: { xs: 2, sm: "5%" }, my: 4, boxSizing: "border-box" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: "1.2rem",
          background: "linear-gradient(135deg, #fdf4ff 0%, #faf5ff 50%, #f3e8ff 100%)",
          border: "1px solid #e9d5ff",
          boxShadow: "0 4px 20px rgba(168, 85, 247, 0.06)",
        }}
      >
      {/* Header Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#9333ea", fontSize: { xs: "1.3rem", sm: "1.5rem" } }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#581c87", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
            ✨ Ask AI About This Product
          </Typography>
        </Box>
        <Chip
          label="⚡ Gemini AI Powered"
          size="small"
          sx={{ bgcolor: "#7e22ce", color: "#ffffff", fontWeight: 700, fontSize: "0.72rem" }}
        />
      </Box>

      <Typography variant="body2" sx={{ color: "#6b21a8", mb: 2, fontWeight: 500, fontSize: "0.88rem" }}>
        Have a question before buying? Ask Gemini AI anything about {productName}!
      </Typography>

      {/* Suggested Quick Question Chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <Chip
            key={idx}
            label={`💡 ${q}`}
            onClick={() => handleAskQuestion(q)}
            disabled={loading}
            sx={{
              bgcolor: "#ffffff",
              color: "#6b21a8",
              fontWeight: 600,
              fontSize: "0.8rem",
              border: "1px solid #d8b4fe",
              cursor: "pointer",
              "&:hover": { bgcolor: "#f3e8ff", borderColor: "#a855f7" },
            }}
          />
        ))}
      </Box>

      {/* Input Box */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask a question (e.g. Is this jacket machine washable?)"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAskQuestion();
            }
          }}
          disabled={loading}
          sx={{ bgcolor: "#ffffff", borderRadius: "10px", "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
        />
        <Button
          type="button"
          onClick={() => handleAskQuestion()}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
            color: "#ffffff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
            minWidth: "110px",
            boxShadow: "0 4px 14px rgba(168, 85, 247, 0.35)",
            "&:hover": { background: "linear-gradient(135deg, #9333ea 0%, #db2777 100%)" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#ffffff" }} />
          ) : (
            <>
              <SendIcon sx={{ fontSize: 18, mr: 0.8 }} />
              Ask
            </>
          )}
        </Button>
      </Box>

      {/* Q&A Responses History */}
      {qaHistory.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {qaHistory.map((item, idx) => (
            <Box key={idx} sx={{ p: 2, bgcolor: "#ffffff", borderRadius: "12px", border: "1px solid #e9d5ff" }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#581c87", mb: 0.8, display: "flex", alignItems: "center", gap: 1 }}>
                <QuestionAnswerIcon sx={{ fontSize: "1.1rem", color: "#c026d3" }} /> Q: {item.question}
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500, lineHeight: 1.6, pl: 3.2 }}>
                {item.answer}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      </Paper>
    </Box>
  );
};

export default AIProductQASection;
