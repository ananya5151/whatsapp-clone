// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { format, isToday, isYesterday } from 'date-fns';
import './App.css';

// Your live Render backend URL
const RENDER_BACKEND_URL = "https://whatsapp-clone-88mx.onrender.com";

// Configure URLs for API and WebSocket
const API_BASE = process.env.NODE_ENV === 'production' ? `${RENDER_BACKEND_URL}/api` : 'http://localhost:5000/api';
const SOCKET_URL = process.env.NODE_ENV === 'production' ? RENDER_BACKEND_URL : 'http://localhost:5000';
const App = () => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState('online');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '🙏', '👋', '✅', '❌'];

  // Effect for initial setup
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    fetchConversations();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    return () => {
      newSocket.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect for handling real-time socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (message) => {
      if (selectedChat && selectedChat._id === message.wa_id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.on('updateConversation', (updatedConv) => {
        setConversations(prevConvos => {
            const existingConv = prevConvos.find(c => c._id === updatedConv._id);
            if (existingConv) {
                // Update existing conversation
                const updatedConvos = prevConvos.map(c => c._id === updatedConv._id ? {...c, ...updatedConv} : c);
                return updatedConvos.sort((a,b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
            } else {
                // Add new conversation
                return [updatedConv, ...prevConvos].sort((a,b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
            }
        });
    });

    return () => {
      socket.off('newMessage');
      socket.off('updateConversation');
    };
  }, [socket, selectedChat]);

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // In client/src/App.js, replace the existing fetchConversations function

const fetchConversations = async () => {
    setLoading(true);
    console.log('Frontend: Attempting to fetch conversations...');
    try {
      const response = await axios.get(`${API_BASE}/conversations`);
      console.log('Frontend: API call successful. Response:', response);

      // IMPORTANT: Check if the response data is actually an array
      if (Array.isArray(response.data)) {
        setConversations(response.data);
      } else {
        console.error('Frontend Error: Data received from API is not an array!', response.data);
        setConversations([]); // Set to empty array to prevent crash
      }

    } catch (error) {
      console.error('Frontend: API call failed!', error.response || error);
      setConversations([]); // Set to empty array on error to prevent crash
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (wa_id) => {
    try {
      const response = await axios.get(`${API_BASE}/messages/${wa_id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
    setSearchQuery('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    const messageData = {
      wa_id: selectedChat._id,
      name: selectedChat.name,
      body: newMessage.trim(),
    };
    await axios.post(`${API_BASE}/send`, messageData);
    setNewMessage('');
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const formatTime = (timestamp) => format(new Date(timestamp), 'HH:mm');

  const formatLastSeen = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return `today at ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `yesterday at ${format(date, 'HH:mm')}`;
    return format(date, 'dd/MM/yyyy at HH:mm');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'TODAY';
    if (isYesterday(date)) return 'YESTERDAY';
    return format(date, 'dd/MM/yyyy');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '🕐';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓'; // Should have a different color via CSS
      default: return '○';
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="whatsapp-logo">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.486" fill="#25D366"/>
          </svg>
        </div>
        <div className="loading-spinner"></div>
        <p>WhatsApp</p>
      </div>
    );
  }

  return (
    <div className="whatsapp-container">
      <div className={`sidebar ${isMobile && selectedChat ? 'hidden-mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar"><span>ME</span></div>
            <span className="user-name">My WhatsApp</span>
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="New chat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm4 9h-3v3a1 1 0 0 1-2 0v-3H8a1 1 0 0 1 0-2h3V8a1 1 0 0 1 2 0v3h3a1 1 0 0 1 0 2z"/></svg>
            </button>
            <button className="icon-btn" title="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>
        </div>
        <div className="search-container">
          <div className="search-input">
            <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && (<button className="clear-search" onClick={() => setSearchQuery('')}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>)}
          </div>
        </div>
        <div className="filter-tabs">
          <button className="filter-tab active">All</button>
          <button className="filter-tab">Unread</button>
          <button className="filter-tab">Favorites</button>
          <button className="filter-tab">Groups</button>
        </div>
        <div className="conversations-list">
          {filteredConversations.length === 0 ? (<div className="no-results"><p>No chats found</p></div>) : (
            filteredConversations.map((conv) => (
              <div key={conv._id} className={`conversation-item ${selectedChat?._id === conv._id ? 'active' : ''}`} onClick={() => handleChatSelect(conv)}>
                <div className="conversation-avatar">
                  <span>{conv.name.charAt(0).toUpperCase()}</span>
                  <div className="online-indicator active"></div>
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h3>{conv.name}</h3>
                    <span className="time">{formatTime(conv.lastMessageTimestamp)}</span>
                  </div>
                  <div className="conversation-preview">
                    <p>{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && <span className="unread-count">{conv.unreadCount}</span>}
                  </div>
                </div>
                <div className="conversation-actions"><button className="pin-btn" title="Pin chat">📌</button></div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className={`chat-area ${!selectedChat ? 'no-chat' : ''} ${isMobile && !selectedChat ? 'hidden-mobile' : ''}`}>
        {selectedChat ? (
          <>
            <div className="chat-header">
              {isMobile && (<button className="back-btn" onClick={() => setSelectedChat(null)}><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></button>)}
              <div className="chat-user-info">
                <div className="chat-avatar">
                  <span>{selectedChat.name.charAt(0).toUpperCase()}</span>
                  <div className="online-indicator active"></div>
                </div>
                <div className="chat-info">
                  <h3>{selectedChat.name}</h3>
                  <p className="status">{onlineStatus === 'online' ? 'online' : `last seen ${formatLastSeen(new Date())}`}</p>
                </div>
              </div>
              <div className="chat-actions">
                <button className="icon-btn" title="Video call"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg></button>
                <button className="icon-btn" title="Audio call"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.02.74-.25 1.02l-2.2 2.2z"/></svg></button>
                <button className="icon-btn" title="Search"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></button>
                <button className="icon-btn" title="More"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
              </div>
            </div>
            <div className="messages-container">
              {messages.map((message, index) => {
                const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
                return (
                  <div key={message._id || index}>
                    {showDate && (<div className="date-separator"><span>{formatDate(message.timestamp)}</span></div>)}
                    <div className={`message ${message.from_me ? 'sent' : 'received'}`}>
                      <div className="message-content">
                        <p>{message.body}</p>
                        <div className="message-meta">
                          <span className="time">{formatTime(message.timestamp)}</span>
                          {message.from_me && (<span className={`status ${message.status}`}>{getStatusIcon(message.status)}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (<div className="typing-indicator"><div className="typing-dots"><span></span><span></span><span></span></div></div>)}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-container">
              <button className="icon-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Emoji">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" color="#8696a0"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.5 8C9.33 8 10 8.67 10 9.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5S16.33 11 15.5 11 14 10.33 14 9.5 14.67 8 15.5 8zm-3.5 6.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg>
              </button>
              <button className="icon-btn" title="Attach">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" color="#8696a0" transform="rotate(45)"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H10v9.5a2.5 2.5 0 0 0 5 0V5c-1.93 0-3.5 1.57-3.5 3.5v11.5c1.38 0 2.5-1.12 2.5-2.5V6h-1.5z"/></svg>
              </button>
              <form onSubmit={handleSendMessage} className="message-form">
                <input ref={messageInputRef} type="text" value={newMessage} onChange={handleInputChange} placeholder="Type a message" className="message-input" />
                <button type="submit" className="send-btn">
                  {newMessage.trim() ? (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>) : (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>)}
                </button>
              </form>
              {showEmojiPicker && (<div className="emoji-picker">{emojis.map((emoji, index) => (<button key={index} className="emoji-btn" onClick={() => handleEmojiClick(emoji)}>{emoji}</button>))}</div>)}
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <div className="whatsapp-web-logo">
                <svg width="320" height="320" viewBox="0 0 24 24" fill="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.486" fill="#3c3c41"/></svg>
              </div>
              <h2>WhatsApp Web</h2>
              <p>Send and receive messages without keeping your phone online.</p>
              <p>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
              <div className="encryption-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                <span>Your personal messages are end-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;