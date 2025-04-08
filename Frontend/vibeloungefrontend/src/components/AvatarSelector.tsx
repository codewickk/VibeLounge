type Props = {
  selected: string;
  setSelected: (avatar: string) => void;
};

export default function AvatarSelector({ selected, setSelected }: Props) {
  const avatars = Array.from({ length: 10 }, (_, i) => `avatar${i + 1}.jpg`);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose your avatar
      </label>
      <div className="flex flex-wrap gap-3 justify-center p-3 bg-white rounded-lg border border-gray-200">
        {avatars.map((avatar) => (
          <div
            key={avatar}
            className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer transition-all duration-200 ${
              selected === avatar
                ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110'
                : 'hover:scale-105'
            }`}
            onClick={() => setSelected(avatar)}
          >
            <img
              src={`/src/assets/${avatar}`}
              alt={`Avatar ${avatar}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${avatar}&background=random`;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}