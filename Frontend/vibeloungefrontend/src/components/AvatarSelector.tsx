type Props = {
    selected: string;
    setSelected: (avatar: string) => void;
  };
  
  export default function AvatarSelector({ selected, setSelected }: Props) {
    const avatars = Array.from({ length: 10 }, (_, i) => `avatar${i + 1}.jpg`);
  
    return (
      <div>
        <p className="text-sm text-gray-600 mb-2">Select an avatar</p>
        <div className="grid grid-cols-5 gap-3">
          {avatars.map((a) => (
            <img
              key={a}
              src={`/src/assets/${a}`}
              alt={a}
              className={`w-14 h-14 rounded-full border-2 cursor-pointer ${
                selected === a ? 'border-black' : 'border-transparent'
              }`}
              onClick={() => setSelected(a)}
            />
          ))}
        </div>
      </div>
    );
  }
  