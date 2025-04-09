import React from 'react';

interface MessageProps {
  message: {
    type: string;
    metadata: {
      name: string;
      avatarUrl: string;
      timestamp: number;
    };
    payload?: {
      message: string;
    };
  };
  isSelf: boolean;
}

const MessageBubble: React.FC<MessageProps> = ({ message, isSelf }) => {
  const { metadata, payload, type } = message;
  

  const isSystemMessage = type === 'system';
  
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-600 text-xs py-1 px-3 rounded-full">
          {payload?.message || 'System notification'}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} my-3`}>
      {!isSelf && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
            <img
              src={metadata.avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {

                e.currentTarget.src = `https://ui-avatars.com/api/?name=${metadata.name}&background=random`;
              }}
            />
          </div>
        </div>
      )}
      
      <div
        className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
          isSelf
            ? 'bg-indigo-500 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
        }`}
      >
        <div className="font-medium text-sm">
          {metadata.name}
        </div>
        
        {type === 'chat' && payload?.message && (
          <div className="mt-1">{payload.message}</div>
        )}
        
        {type === 'join' && payload?.message && (
          <div className="text-xs opacity-80">{payload.message}</div>
        )}
        
        <div className={`text-xs mt-1 ${isSelf ? 'text-indigo-100' : 'text-gray-400'}`}>
          {new Date(metadata.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;