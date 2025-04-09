import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import MessageBubble from '../components/MessageBubble';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [participants, setParticipants] = useState<{name: string, avatarUrl: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const { roomId } = useParams();
  const { name, avatarUrl } = location.state || {};

  useEffect(() => {

    if (!roomId || !name) {
      navigate('/');
      return;
    }


    setMessages([
      {
        type: 'system',
        metadata: { name: 'System', timestamp: Date.now() },
        payload: { message: 'Connecting to chat room...' }
      }
    ]);


    const socket = new WebSocket('wss://vibeloungebackend.onrender.com');
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus('connected');
      
   
      setParticipants([{name, avatarUrl}]);
      

      socket.send(JSON.stringify({
        type: 'join',
        roomId,
        metadata: { name, avatarUrl, timestamp: Date.now() }
      }));
    };

 
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
     
        if (data.type === 'participantList' && data.payload?.participants) {
        
          setParticipants(data.payload.participants);
        } else {
        
          setMessages(prev => [...prev, data]);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

  
    socket.onerror = (err) => {
      console.error('WebSocket Error:', err);
      setConnectionStatus('error');
      setMessages(prev => [
        ...prev,
        {
          type: 'system',
          metadata: { name: 'System', timestamp: Date.now() },
          payload: { message: 'Connection error. Please try refreshing the page.' }
        }
      ]);
    };

 
    socket.onclose = () => {
      setConnectionStatus('error');
      setMessages(prev => [
        ...prev,
        {
          type: 'system',
          metadata: { name: 'System', timestamp: Date.now() },
          payload: { message: 'Disconnected from chat. Please refresh to reconnect.' }
        }
      ]);
    };

 
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [roomId, name, avatarUrl, navigate]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSend = () => {
    if (!newMessage.trim() || connectionStatus !== 'connected') return;

    const msg = {
      type: 'chat',
      roomId,
      metadata: { name, avatarUrl, timestamp: Date.now() },
      payload: { message: newMessage }
    };

    try {
      socketRef.current?.send(JSON.stringify(msg));
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [
        ...prev,
        {
          type: 'system',
          metadata: { name: 'System', timestamp: Date.now() },
          payload: { message: 'Failed to send message. Please try again.' }
        }
      ]);
    }
  };


  const handleLeaveRoom = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
   
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Room: {roomId}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">
                {connectionStatus === 'connected' 
                  ? `${participants.length} participant${participants.length !== 1 ? 's' : ''}` 
                  : 'Connecting...'}
              </p>
         
              <div className="flex -space-x-2">
                {participants.map((participant, idx) => (
                  <div 
                    key={idx} 
                    className="w-6 h-6 rounded-full overflow-hidden border border-white"
                    title={participant.name}
                  >
                    <img 
                      src={participant.avatarUrl} 
                      alt={participant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${participant.name}&background=random`;
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6">
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={idx} 
            message={msg} 
            isSelf={msg.metadata?.name === name} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>


      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            type="text"
            value={newMessage}
            disabled={connectionStatus !== 'connected'}
            placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connecting..."}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={connectionStatus !== 'connected' || !newMessage.trim()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;