import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MessageBubble from '../components/MessageBubble';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { roomId, name, avatarUrl } = location.state || {};

  useEffect(() => {
    if (!roomId || !name || !avatarUrl) {
      navigate('/');
      return;
    }

    const socket = new WebSocket('wss://vibeloungebackend.onrender.com');
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join',
        roomId,
        metadata: { name, avatarUrl, timestamp: Date.now() }
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    socket.onerror = (err) => console.error('WebSocket Error:', err);
    socket.onclose = () => console.warn('WebSocket closed');

    return () => socket.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg = {
      type: 'chat',
      roomId,
      metadata: { name, avatarUrl, timestamp: Date.now() },
      payload: { message: newMessage }
    };

    socketRef.current?.send(JSON.stringify(msg));
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col">
      <div className="flex justify-between items-center p-4 shadow-sm bg-white">
        <h1 className="text-lg font-semibold text-gray-800">Room: {roomId}</h1>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-red-500 hover:underline"
        >
          Exit Room
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} isSelf={msg.metadata.name === name} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typing && (
        <div className="text-sm text-gray-500 px-4 py-1">Someone is typing...</div>
      )}

      <div className="p-4 bg-white border-t flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          type="text"
          value={newMessage}
          placeholder="Type a message..."
          onChange={(e) => {
            setNewMessage(e.target.value);
            setTyping(true);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
