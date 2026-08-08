import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Typography,
  IconButton,
  TextField,
  Paper,
  CircularProgress,
  Avatar,
  Button,
  Chip,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import { api } from '@/services/api';
import ProductCard from '@/components/Home/ProductCard';
import { useAppSelector } from '@/app/hooks';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  recommendedProducts?: any[];
}

const AIChatWidget: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);

  const [open, setOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mode: 'ai' | 'human_waiting' | 'human_active'
  const [chatMode, setChatMode] = useState<'ai' | 'human_waiting' | 'human_active'>('ai');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm Afzal AI, your AI Shopping Assistant. Looking for something specific, a gift idea, or style recommendations? Ask me anything!",
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Clean up socket when widget unmounts or mode ends
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Request Live Support Agent Escalation
  const handleRequestHumanSupport = () => {
    if (chatMode !== 'ai') return;

    setLoading(true);
    setChatMode('human_waiting');

    const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : window.location.origin;
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setLoading(false);
      setChatMode('ai');
      toast.error('Could not connect to live support server. Please try again.');
    });

    socket.on('connect', () => {
      const customerName = user?.name || 'Valued Shopper';
      const customerEmail = user?.email || 'Guest User';

      socket.emit('request_support', {
        customerName,
        customerEmail,
        initialMessage: inputMessage.trim() || undefined,
      });
    });

    socket.on('support_session_created', (data: any) => {
      setActiveSessionId(data.sessionId);
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: "🟡 **Request Sent!** Connecting you to an online Support Agent... Please stay on this screen.",
        },
      ]);
    });

    socket.on('support_room_joined', () => {
      setChatMode('human_active');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'agent',
          text: "🟢 **Support Agent has joined the chat!** How can I assist you today?",
        },
      ]);
    });

    socket.on('receive_support_message', (data: { sessionId: string; message: any }) => {
      if (data.message.sender === 'admin') {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            sender: 'agent',
            text: data.message.text,
          },
        ]);
      }
    });

    socket.on('support_session_ended', () => {
      setChatMode('ai');
      setActiveSessionId(null);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      toast.info('Live support chat session ended. Afzal AI is back to help you!');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: "🔴 **Live Chat Ended.** I'm Afzal AI, back to help you with product search and recommendations!",
        },
      ]);
    });
  };

  const handleCancelHumanSupport = () => {
    if (socketRef.current && activeSessionId) {
      socketRef.current.emit('end_support_session', { sessionId: activeSessionId });
    }
    setChatMode('ai');
    setActiveSessionId(null);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    toast.info('Cancelled live support request.');
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: "🔴 **Live support request cancelled.** Afzal AI is back to help you!",
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    const userMsgObj: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');

    // If currently connected to a Live Human Agent over Socket.io
    if (chatMode === 'human_active' || chatMode === 'human_waiting') {
      if (socketRef.current && activeSessionId) {
        socketRef.current.emit('send_support_message', {
          sessionId: activeSessionId,
          sender: 'customer',
          text: userText,
        });
      }
      return;
    }

    // Otherwise, normal AI Assistant Endpoint
    setLoading(true);
    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const { data } = await api.post('/ai/chat', {
        message: userText,
        history: historyPayload,
      });

      const botMsgObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || "I couldn't process that right now.",
        recommendedProducts: data.recommendedProducts || [],
      };

      setMessages((prev) => [...prev, botMsgObj]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: "I'm having trouble connecting right now. Please try asking again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Keyframe Animations for Glowing Floating Effect */}
      <Box
        sx={{
          '@keyframes pulseGlow': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.6), 0 8px 24px rgba(99, 102, 241, 0.4)',
            },
            '50%': {
              boxShadow: '0 0 20px 8px rgba(168, 85, 247, 0.7), 0 12px 32px rgba(168, 85, 247, 0.6)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.6), 0 8px 24px rgba(99, 102, 241, 0.4)',
            },
          },
          '@keyframes floatBounce': {
            '0%, 100%': {
              transform: 'translateY(0px)',
            },
            '50%': {
              transform: 'translateY(-6px)',
            },
          },
          '@keyframes rotateSparkle': {
            '0%': { transform: 'rotate(0deg) scale(1)' },
            '50%': { transform: 'rotate(180deg) scale(1.15)' },
            '100%': { transform: 'rotate(360deg) scale(1)' },
          },
        }}
      >
        {/* Floating Action Button */}
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 1200,
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            color: '#ffffff',
            animation: 'floatBounce 3s ease-in-out infinite, pulseGlow 2.5s infinite',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #db2777 100%)',
              transform: 'scale(1.1) translateY(-4px)',
              boxShadow: '0 0 30px 12px rgba(236, 72, 153, 0.8), 0 16px 36px rgba(168, 85, 247, 0.6)',
            },
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <AutoAwesomeIcon
            sx={{
              fontSize: '1.75rem',
              animation: 'rotateSparkle 8s linear infinite',
              filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))',
            }}
          />
        </Fab>
      </Box>

      {/* Slide-in Chat Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: '420px' },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f8fafc',
          },
        }}
      >
        {/* Chat Drawer Header */}
        <Box
          sx={{
            p: 2.5,
            background: chatMode === 'human_active'
              ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
              : chatMode === 'human_waiting'
              ? 'linear-gradient(135deg, #854d0e 0%, #a16207 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: chatMode === 'human_active' ? '#10b981' : chatMode === 'human_waiting' ? '#eab308' : '#a855f7',
                width: 38,
                height: 38,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {chatMode === 'ai' ? <SmartToyIcon sx={{ fontSize: '1.3rem' }} /> : <HeadsetMicIcon sx={{ fontSize: '1.3rem' }} />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {chatMode === 'human_active'
                  ? '🟢 Live Human Support'
                  : chatMode === 'human_waiting'
                  ? '🟡 Connecting Agent...'
                  : 'Afzal AI Assistant'}
              </Typography>
              <Typography variant="caption" sx={{ color: chatMode === 'human_active' ? '#6ee7b7' : '#c084fc', fontWeight: 600 }}>
                {chatMode === 'human_active' ? '⚡ Connected via WebSockets' : chatMode === 'human_waiting' ? '⏳ Waiting in queue...' : '⚡ Powered by Gemini AI'}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Live Human Support Escalation Action Bar */}
        {chatMode === 'ai' ? (
          <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={<HeadsetMicIcon sx={{ fontSize: '1.1rem' }} />}
              label="💬 Speak to a Live Human Support Agent"
              onClick={handleRequestHumanSupport}
              color="secondary"
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                bgcolor: '#ffffff',
                borderColor: '#c084fc',
                color: '#7e22ce',
                '&:hover': { bgcolor: '#f3e8ff' },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 1.2, bgcolor: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleCancelHumanSupport}
              startIcon={<CloseIcon />}
              sx={{ fontWeight: 700, fontSize: '0.78rem', borderRadius: '8px' }}
            >
              {chatMode === 'human_waiting' ? 'Cancel Live Request' : 'End Live Agent Chat'}
            </Button>
          </Box>
        )}

        {/* Chat Messages Body */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  maxWidth: '85%',
                  borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  bgcolor: msg.sender === 'user' ? '#6366f1' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                  '& ul, & ol': { m: 0, pl: 2.5, mb: 1, '&:last-child': { mb: 0 } },
                  '& li': { mb: 0.5 },
                  '& strong': { fontWeight: 700 },
                }}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </Paper>

              {/* Recommended Product Cards inside Chat */}
              {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: '90%' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🔥 AI Recommended Products:
                  </Typography>
                  {msg.recommendedProducts.map((p) => (
                    <Box key={p._id} onClick={() => setOpen(false)}>
                      <ProductCard product={p} showAddToCart={true} showWishlistHeart={false} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#ffffff', borderRadius: '14px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
              <CircularProgress size={16} sx={{ color: '#a855f7' }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Afzal AI is searching live catalog...
              </Typography>
            </Box>
          )}
          <div ref={chatBottomRef} />
        </Box>

        {/* Input Bar */}
        <Box sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask Afzal AI anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              sx={{ bgcolor: '#f8fafc', borderRadius: '10px' }}
            />
            <IconButton
              type="submit"
              disabled={!inputMessage.trim() || loading}
              sx={{
                bgcolor: '#a855f7',
                color: '#ffffff',
                '&:hover': { bgcolor: '#9333ea' },
                '&.Mui-disabled': { bgcolor: '#cbd5e1', color: '#ffffff' },
              }}
            >
              <SendIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          </form>
        </Box>
      </Drawer>
    </>
  );
};

export default AIChatWidget;
