import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AvatarSelector from '../components/AvatarSelector';

export default function FormPage() {
  const { action } = useParams();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('avatar1.jpg');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId.trim()) {
      return alert('Please enter a room ID');
    }

    if (!name.trim()) {
      return alert('Please enter your display name');
    }

    setIsLoading(true);

    navigate(`/chat/${roomId}`, {
      state: {
        name,
        avatarUrl: `/avatars/${avatar}`  // ✅ Corrected path
      }
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VibeLounge 🎧</h1>
          <p className="mt-2 text-gray-600">
            {action === 'create' ? 'Create a new room' : 'Join an existing room'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-5"
        >
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              placeholder={action === 'create' ? "Create a unique room ID" : "Enter room ID to join"}
              className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Display Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="How others will see you"
              className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <AvatarSelector
            selected={avatar}
            setSelected={(value: string) => setAvatar(value)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Connecting...' : `${action === 'create' ? 'Create' : 'Join'} Room`}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
