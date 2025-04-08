import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to VibeLounge 🎧</h1>
      <p className="text-gray-600 mb-10 text-center max-w-md">
        Real-time group chat app to vibe and connect with your friends. Clean. Minimal. Instant.
      </p>
      <div className="flex gap-6">
        <button
          onClick={() => navigate('/form/create')}
          className="px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition"
        >
          Create Room
        </button>
        <button
          onClick={() => navigate('/form/join')}
          className="px-6 py-3 rounded-xl border border-black hover:bg-black hover:text-white transition"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
