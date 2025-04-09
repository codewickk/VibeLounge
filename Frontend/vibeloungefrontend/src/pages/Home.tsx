import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12 max-w-2xl w-full text-center">
        
    
        <div className="flex justify-center items-center mb-6">
          <span className="text-4xl mr-3">🎧</span>
          <h1 className="text-4xl font-bold text-gray-800">VibeLounge</h1>
        </div>

 
        <div className="border-b border-gray-200 mb-6"></div>

    
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Real-time group chat app to vibe and connect with your friends. <br />
          Clean. Minimal. Instant.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 flex justify-center items-start text-left">
          <div className="text-xl mr-3">💡</div>
          <div className="text-sm text-gray-700">
            Create a room to start a new conversation, or join an existing room with an ID.
          </div>
        </div>

     
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/form/create')}
            className="flex-1 py-3 px-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-semibold transition-colors"
          >
            + Create Room
          </button>
          <button
            onClick={() => navigate('/form/join')}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
          >
            → Join Room
          </button>
        </div>

   
        <div className="mt-8 text-xs text-gray-400">
          Made with ♥ for seamless conversations
        </div>
      </div>
    </div>
  );
}
