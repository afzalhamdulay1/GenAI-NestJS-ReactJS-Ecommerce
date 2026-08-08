import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Admin/Sidebar";
import MetaData from "@/components/Layout/MetaData";
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  TextField,
  IconButton,
  Button,
  Divider,
  Badge,
} from "@mui/material";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

export interface SupportMessage {
  id: string;
  sender: "customer" | "admin";
  text: string;
  timestamp: string;
}

export interface SupportSession {
  sessionId: string;
  customerSocketId: string;
  customerName: string;
  customerEmail?: string;
  status: "waiting" | "active" | "closed";
  createdAt: string;
  messages: SupportMessage[];
}

const AdminSupportChat: React.FC = () => {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.sessionId === selectedSessionId);

  useEffect(() => {
    // Connect to Backend WebSocket Gateway
    const backendUrl = window.location.hostname === "localhost" ? "http://localhost:4000" : window.location.origin;
    const socket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("⚡ Admin Support Chat connected to WebSockets");
      socket.emit("get_support_sessions");
    });

    socket.on("support_sessions_updated", (sessionList: SupportSession[]) => {
      setSessions(sessionList);
      // Auto select first waiting session if none selected
      if (sessionList.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionList[0].sessionId);
      }
    });

    socket.on("new_support_request", (data: { customerName: string; sessionId: string }) => {
      toast.warn(`💬 New Live Support Request from ${data.customerName}!`, {
        autoClose: 8000,
        position: "top-right",
      });
    });

    socket.on("receive_support_message", (data: { sessionId: string; message: SupportMessage }) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.sessionId === data.sessionId) {
            return {
              ...s,
              messages: [...s.messages, data.message],
            };
          }
          return s;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedSessionId]);

  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTo({
        top: chatMessagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeSession?.messages, selectedSessionId]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    if (socketRef.current) {
      socketRef.current.emit("join_support_room", { sessionId, role: "admin" });
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId || !socketRef.current) return;

    socketRef.current.emit("send_support_message", {
      sessionId: selectedSessionId,
      sender: "admin",
      text: replyText.trim(),
    });

    setReplyText("");
  };

  const handleEndSession = (sessionId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("end_support_session", { sessionId });
      toast.info(`Closed support session #${sessionId.slice(-6)}`);
      setSelectedSessionId(null);
    }
  };

  return (
    <div className="dashboard">
      <MetaData title="Live Customer Support Chat - Admin Panel" />
      <Sidebar />
      <div className="dashboardContainer">
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <HeadsetMicIcon sx={{ fontSize: "2.2rem", color: "#9333ea" }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
                  Live Customer Support Hub
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                  Real-time multi-customer support powered by WebSockets
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${sessions.filter((s) => s.status === "waiting").length} Waiting Request(s)`}
              color={sessions.some((s) => s.status === "waiting") ? "warning" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </Box>

          <Grid container spacing={3}>
            {/* Left Queue Sidebar */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  height: "70vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: "#334155" }}>
                  Active Customer Queue ({sessions.length})
                </Typography>
                <Divider sx={{ mb: 1.5 }} />

                {sessions.length === 0 ? (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textTransform: "none" }}>
                    <HeadsetMicIcon sx={{ fontSize: "3rem", color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                      No active customer support requests.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ flex: 1, overflowY: "auto" }}>
                    {sessions.map((s) => (
                      <ListItemButton
                        key={s.sessionId}
                        selected={selectedSessionId === s.sessionId}
                        onClick={() => handleSelectSession(s.sessionId)}
                        sx={{
                          borderRadius: "12px",
                          mb: 1,
                          border: selectedSessionId === s.sessionId ? "2px solid #a855f7" : "1px solid #f1f5f9",
                          bgcolor: selectedSessionId === s.sessionId ? "#faf5ff" : "#ffffff",
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: s.status === "active" ? "#10b981" : "#f59e0b" }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e293b" }}>
                                {s.customerName}
                              </Typography>
                              <Chip
                                label={s.status === "active" ? "Active" : "Waiting"}
                                size="small"
                                color={s.status === "active" ? "success" : "warning"}
                                sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                              {s.messages.length > 0 ? s.messages[s.messages.length - 1].text.slice(0, 30) + "..." : "Started chat"}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* Right Active Conversation Panel */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  height: "70vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {activeSession ? (
                  <>
                    {/* Panel Header */}
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: "#9333ea" }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {activeSession.customerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {activeSession.customerEmail || "Guest User"} • Session: #{activeSession.sessionId.slice(-6)}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<HighlightOffIcon />}
                        onClick={() => handleEndSession(activeSession.sessionId)}
                        sx={{ fontWeight: 700, borderRadius: "8px" }}
                      >
                        End Live Session
                      </Button>
                    </Box>

                    {/* Messages Body */}
                    <Box ref={chatMessagesContainerRef} sx={{ flex: 1, p: 2.5, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5, bgcolor: "#f1f5f9" }}>
                      {activeSession.messages.map((m) => (
                        <Box
                          key={m.id}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: m.sender === "admin" ? "flex-end" : "flex-start",
                          }}
                        >
                          <Typography variant="caption" sx={{ color: "#94a3b8", mb: 0.3, px: 0.5, fontWeight: 600 }}>
                            {m.sender === "admin" ? "You (Support Agent)" : activeSession.customerName} • {m.timestamp}
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.8,
                              maxWidth: "75%",
                              borderRadius: m.sender === "admin" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                              bgcolor: m.sender === "admin" ? "#9333ea" : "#ffffff",
                              color: m.sender === "admin" ? "#ffffff" : "#1e293b",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                              fontWeight: 500,
                              fontSize: "0.92rem",
                            }}
                          >
                            {m.text}
                          </Paper>
                        </Box>
                      ))}
                    </Box>

                    {/* Reply Input Bar */}
                    <Box sx={{ p: 2, bgcolor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
                      <form onSubmit={handleSendReply} style={{ display: "flex", gap: "10px" }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`Reply to ${activeSession.customerName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          sx={{ bgcolor: "#f8fafc" }}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!replyText.trim()}
                          endIcon={<SendIcon />}
                          sx={{ bgcolor: "#9333ea", "&:hover": { bgcolor: "#7e22ce" }, fontWeight: 700 }}
                        >
                          Send
                        </Button>
                      </form>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <HeadsetMicIcon sx={{ fontSize: "4rem", color: "#e2e8f0", mb: 1.5 }} />
                    <Typography variant="subtitle1" sx={{ color: "#64748b", fontWeight: 700 }}>
                      Select a customer chat from the queue to start live messaging
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
};

export default AdminSupportChat;
