import React from 'react';

interface MessageProps {
  message: any;
  isSelf: boolean;
}

const MessageBubble: React.FC<MessageProps> = ({ message, isSelf }) => {
  const { metadata, payload, type } = message;

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} my-2`}>
      {!isSelf && (
        <img
          src={metadata.avatarUrl}
          alt="avatar"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div
        className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
          isSelf
            ? 'bg-indigo-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="font-semibold">{metadata.name}</div>
        {type === 'chat' && <div>{payload.message}</div>}
        <div className="text-xs text-gray-400 mt-1">
          {new Date(metadata.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
