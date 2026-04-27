import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, MessageSquare, User, Hash, ArrowLeft, Filter, Camera, Ghost, ExternalLink, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processSnapData, processInstagramData, filterMessages } from './utils/dataProcessor';
import { format, isSameDay } from 'date-fns';

const App = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchType, setSearchType] = useState('friends'); // 'friends' or 'messages'
  const [dataSource, setDataSource] = useState('snapchat'); // 'snapchat' or 'instagram'
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [messageLimit, setMessageLimit] = useState(50);
  const [friendLimit, setFriendLimit] = useState(100);

  useEffect(() => {
    setMessageLimit(50);
  }, [selectedChat?.id, selectedChat?.username]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setSelectedChat(null);
      const data = dataSource === 'snapchat' ? await processSnapData() : await processInstagramData();
      setConversations(data);
      setLoading(false);
    };
    loadData();
  }, [dataSource]);

  const filteredConversations = useMemo(() => {
    if (!globalSearch) return conversations;
    const lowerQuery = globalSearch.toLowerCase();
    
    return conversations.map(conv => {
      // If searching friends, just check names
      if (searchType === 'friends') {
        const matches = conv.displayName.toLowerCase().includes(lowerQuery) ||
                       conv.username.toLowerCase().includes(lowerQuery);
        return matches ? conv : null;
      }
      
      // If searching messages, find matching messages
      const matchingMessages = conv.messages.filter(m => {
        const content = (m.content || m.Content || '').toLowerCase();
        return content.includes(lowerQuery);
      });
      
      if (matchingMessages.length > 0) {
        return { ...conv, matchCount: matchingMessages.length };
      }
      return null;
    }).filter(Boolean);
  }, [conversations, globalSearch, searchType]);

  const activeChatMessages = useMemo(() => {
    if (!selectedChat) return [];
    return filterMessages(selectedChat.messages, searchQuery, dateRange);
  }, [selectedChat, searchQuery, dateRange]);

  const visibleConversations = useMemo(() => {
    return filteredConversations.slice(0, friendLimit);
  }, [filteredConversations, friendLimit]);

  const visibleMessages = useMemo(() => {
    return activeChatMessages.slice(0, messageLimit);
  }, [activeChatMessages, messageLimit]);

  if (loading) {
    return (
      <div className="empty-state">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Hash size={40} color="var(--accent)" />
        </motion.div>
        <p style={{ marginTop: 20 }}>Veriler işleniyor...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
            <h1 style={{ margin: 0 }}>Viewer</h1>
            <div className="source-toggle">
              <button
                className={`toggle-btn ${dataSource === 'snapchat' ? 'active' : ''}`}
                onClick={() => setDataSource('snapchat')}
                title="Snapchat"
              >
                <Ghost size={18} />
              </button>
              <button
                className={`toggle-btn ${dataSource === 'instagram' ? 'active' : ''}`}
                onClick={() => setDataSource('instagram')}
                title="Instagram"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
          <div className="controls">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: 40 }}
                  placeholder={searchType === 'friends' ? "Arkadaş ara..." : "Tüm mesajlarda ara..."}
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
              <div className="search-type-toggle">
                <button
                  className={`type-btn ${searchType === 'friends' ? 'active' : ''}`}
                  onClick={() => setSearchType('friends')}
                >
                  Kişiler
                </button>
                <button
                  className={`type-btn ${searchType === 'messages' ? 'active' : ''}`}
                  onClick={() => setSearchType('messages')}
                >
                  Mesajlar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="friend-list">
          {visibleConversations.map((conv) => (
            <div
              key={conv.username}
              className={`friend-item ${selectedChat?.username === conv.username ? 'active' : ''}`}
              onClick={() => {
                setSelectedChat(conv);
                if (searchType === 'messages') {
                  setSearchQuery(globalSearch);
                } else {
                  setSearchQuery('');
                }
              }}
            >
              <div className="avatar">
                {(conv.displayName || conv.username || "?").charAt(0).toUpperCase()}
              </div>
              <div className="friend-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="friend-name">{conv.displayName || conv.username}</div>
                  {conv.matchCount && (
                    <span className="match-badge">{conv.matchCount} eşleşme</span>
                  )}
                </div>
                <div className="last-message">
                  {conv.lastMessage?.content || conv.lastMessage?.Content || (conv.lastMessage?.['Media Type'] ? `[${conv.lastMessage['Media Type']}]` : 'Mesaj yok')}
                </div>
              </div>
            </div>
          ))}

          {filteredConversations.length > friendLimit && (
            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
              <button
                className="load-more-btn"
                style={{ width: '100%', fontSize: 12 }}
                onClick={() => setFriendLimit(prev => prev + 100)}
              >
                Daha Fazla Arkadaş ({filteredConversations.length - friendLimit})
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="chat-area">
        {selectedChat ? (
          <>
            <header className="chat-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="friend-name" style={{ fontSize: 18 }}>{selectedChat.displayName || selectedChat.username}</div>
                  <div className="last-message" style={{ fontSize: 12 }}>@{selectedChat.username}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, width: '60%', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <Calendar size={14} color="var(--text-secondary)" />
                  <input
                    type="date"
                    className="date-input"
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>-</span>
                  <input
                    type="date"
                    className="date-input"
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
                  />
                  {(dateRange.start || dateRange.end) && (
                    <button
                      onClick={() => setDateRange({ start: null, end: null })}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="search-input"
                    style={{ paddingLeft: 36, fontSize: 14 }}
                    placeholder="Kelime ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </header>

            <div className="chat-messages">
              {activeChatMessages.length > messageLimit && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', order: 999 }}>
                  <button
                    className="load-more-btn"
                    onClick={() => setMessageLimit(prev => prev + 100)}
                  >
                    Daha Fazla Mesaj Yükle ({activeChatMessages.length - messageLimit} mesaj daha var)
                  </button>
                </div>
              )}

              {visibleMessages.map((msg, index) => {
                const prevMsg = visibleMessages[index + 1];
                const isValidDate = msg.timestamp instanceof Date && !isNaN(msg.timestamp);
                const prevIsValidDate = prevMsg && prevMsg.timestamp instanceof Date && !isNaN(prevMsg.timestamp);
                const showDate = !prevMsg || (isValidDate && prevIsValidDate && !isSameDay(msg.timestamp, prevMsg.timestamp));
                const isMe = msg.isSender || msg.IsSender;
                const content = msg.content || msg.Content;
                const mediaType = msg['Media Type'];

                return (
                  <React.Fragment key={msg.id}>
                    <div className={`message ${isMe ? 'me' : 'them'} ${msg.isSearchResult ? 'search-highlight' : ''}`}>
                      {content ? (
                        <div className="text-content">{content}</div>
                      ) : mediaType ? (
                        <div className="media-type" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                          [{mediaType}]
                        </div>
                      ) : msg.share ? (
                        <div className="share-content">
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Paylaşılan İçerik</div>
                          {msg.share.share_text && <div style={{ fontSize: 13, marginBottom: 8 }}>{msg.share.share_text}</div>}
                          {msg.share.link && (
                            <a href={msg.share.link} target="_blank" rel="noopener noreferrer" className="share-link">
                              Bağlantıyı Aç <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ) : null}

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="reactions">
                          {msg.reactions.map((r, i) => (
                            <span key={i} title={r.actor} className="reaction-badge">
                              {r.reaction}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="message-time">
                        {format(msg.timestamp, 'HH:mm')}
                      </div>
                    </div>

                    {showDate && (
                      <div className="date-divider">
                        <span className="date-label">
                          {format(msg.timestamp, 'MMMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {activeChatMessages.length === 0 && (
                <div className="empty-state">
                  <p>Mesaj bulunamadı.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <MessageSquare size={64} color="var(--border)" style={{ marginBottom: 20 }} />
            <h2>Sohbet Seçin</h2>
            <p>Mesaj geçmişini görüntülemek için sol taraftan bir arkadaşınızı seçin.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
