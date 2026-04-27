import { format, parseISO, isValid } from 'date-fns';

export const processSnapData = async () => {
  try {
    const [chatRes, friendsRes] = await Promise.all([
      fetch('/data/chat_history.json'),
      fetch('/data/friends.json')
    ]);

    const chatData = await chatRes.json();
    const friendsData = await friendsRes.json();

    // Create a map for display names
    const friendMap = {};
    if (friendsData.Friends) {
      friendsData.Friends.forEach(f => {
        friendMap[f.Username] = f['Display Name'] || f.Username;
      });
    }

    const conversations = [];

    // Process each friend's chat history
    Object.keys(chatData).forEach(username => {
      if (!Array.isArray(chatData[username])) return;

      const messages = chatData[username].map(m => {
        // Snapchat says microseconds but it's often milliseconds (13 digits)
        const ts = m["Created(microseconds)"] || new Date(m.Created).getTime();
        const dateObj = new Date(Number(ts));
        
        let displayDate = 'Invalid Date';
        if (isValid(dateObj)) {
          displayDate = format(dateObj, 'MMM d, yyyy HH:mm');
        }

        return {
          ...m,
          id: Math.random().toString(36).substr(2, 9),
          senderName: m.IsSender ? 'Me' : (friendMap[username] || username),
          timestamp: dateObj,
          displayDate,
        };
      }).filter(m => isValid(m.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp);

      if (messages.length > 0) {
        conversations.push({
          username,
          displayName: friendMap[username] || username,
          messages,
          lastMessage: messages[0],
        });
      }
    });

    // Sort conversations by last message date
    return conversations.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  } catch (error) {
    console.error("Error processing Snapchat data:", error);
    return [];
  }
};

export const processInstagramData = async () => {
  try {
    const response = await fetch('/data/instagram_history.json');
    const data = await response.json();
    const { ownerName, conversations } = data;

    return conversations.map(conv => {
      const messages = conv.messages.map(m => ({
        id: Math.random().toString(36).substr(2, 9),
        senderName: m.sender_name,
        timestamp: new Date(m.timestamp_ms),
        content: m.content,
        reactions: m.reactions,
        share: m.share,
        isSender: m.sender_name === ownerName,
      })).filter(m => isValid(m.timestamp));

      return {
        id: conv.id,
        username: conv.id,
        displayName: conv.title,
        messages,
        lastMessage: messages[0] || {},
      };
    }).sort((a, b) => (b.lastMessage.timestamp || 0) - (a.lastMessage.timestamp || 0));
  } catch (error) {
    console.error("Error processing Instagram data:", error);
    return [];
  }
};

export const filterMessages = (messages, query, dateRange) => {
  if (!query && (!dateRange || (!dateRange.start && !dateRange.end))) {
    return messages;
  }

  const lowerQuery = query ? query.toLowerCase() : '';
  const matchIndices = new Set();

  // First, find all direct matches and their context
  messages.forEach((m, index) => {
    const content = (m.content || m.Content || '').toLowerCase();
    const sender = (m.senderName || '').toLowerCase();
    
    let matchesQuery = !query || content.includes(lowerQuery) || sender.includes(lowerQuery);
    
    let matchesDate = true;
    if (dateRange && (dateRange.start || dateRange.end)) {
      const msgDate = m.timestamp;
      if (dateRange.start && msgDate < dateRange.start) matchesDate = false;
      if (dateRange.end) {
        const endOfSelectedDay = new Date(dateRange.end);
        endOfSelectedDay.setHours(23, 59, 59, 999);
        if (msgDate > endOfSelectedDay) matchesDate = false;
      }
    }

    if (matchesQuery && matchesDate) {
      if (query) {
        // Add context: +/- 10 messages
        for (let i = Math.max(0, index - 10); i <= Math.min(messages.length - 1, index + 10); i++) {
          matchIndices.add(i);
        }
      } else {
        matchIndices.add(index);
      }
    }
  });

  // Sort and return the messages at those indices
  return Array.from(matchIndices)
    .sort((a, b) => a - b) // Keep original order
    .map(index => ({
      ...messages[index],
      isSearchResult: query && (messages[index].content || messages[index].Content || '').toLowerCase().includes(lowerQuery)
    }));
};
