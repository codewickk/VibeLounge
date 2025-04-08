import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6">
      {/* Notion-style container with soft shadow */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
        {/* Heading with emoji - Notion style */}
        <div className="flex items-center mb-6">
          <span className="text-4xl mr-3">🎧</span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">VibeLounge</h1>
        </div>
        
        {/* Notion-style subtle divider */}
        <div className="border-b border-gray-100 mb-6"></div>
        
        {/* Description with Notion-like typography */}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Real-time group chat app to vibe and connect with your friends. 
          Clean. Minimal. Instant.
        </p>
        
        {/* Notion-style callout block */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-8 flex items-start">
          <div className="text-xl mr-3">💡</div>
          <div className="text-gray-700 text-sm">
            Create a room to start a new conversation, or join an existing room with an ID.
          </div>
        </div>
        
        {/* Clean, minimal buttons with subtle hover effects */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => navigate('/form/create')}
            className="flex-1 py-3 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors flex justify-center items-center"
          >
            <span className="mr-2">+</span> Create Room
          </button>
          <button
            onClick={() => navigate('/form/join')}
            className="flex-1 py-3 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg font-medium border border-gray-200 transition-colors flex justify-center items-center"
          >
            <span className="mr-2">→</span> Join Room
          </button>
        </div>
      </div>
      
      {/* Notion-style footer */}
      <div className="mt-8 text-gray-400 text-xs">
        Made with ♥ for seamless conversations
      </div>
    </div>
  );
}