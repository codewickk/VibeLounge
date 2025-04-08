import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AvatarSelector from '../components/AvatarSelector';

export default function FormPage() {
  const { action } = useParams();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('avatar1.png');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !name) return alert('Please fill all fields.');
    const query = new URLSearchParams({ name, avatar }).toString();
    navigate(`/chat/${roomId}?${query}`);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-2xl shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center capitalize">
          {action} a Room
        </h2>
        <input
          type="text"
          placeholder="Room ID"
          className="w-full p-3 rounded-lg border focus:outline-none focus:ring"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Display Name"
          className="w-full p-3 rounded-lg border focus:outline-none focus:ring"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AvatarSelector selected={avatar} setSelected={setAvatar} />
        <button type="submit" className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
          Enter Room
        </button>
      </form>
    </div>
  );
}
