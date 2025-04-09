import { useState } from 'react';

type Props = {
  selected: string;
  setSelected: (avatar: string) => void;
};

export default function AvatarSelector({ selected, setSelected }: Props) {
  // Generate avatar options
  const avatars = Array.from({ length: 10 }, (_, i) => `avatar${i + 1}.jpg`);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(selected);

  const openFullscreenPreview = (avatar: string) => {
    setPreviewAvatar(avatar);
    setIsFullscreenOpen(true);
  };

  const selectAndClose = () => {
    setSelected(previewAvatar);
    setIsFullscreenOpen(false);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose your avatar
      </label>

      {/* Avatar Selection Grid */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        {/* Selected avatar preview */}
        <div className="flex justify-center mb-4">
          <div 
            className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md cursor-pointer"
            onClick={() => openFullscreenPreview(selected)}
          >
            <img
              src={`/avatars/${selected}`}
              alt="Selected avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${selected}&background=random`;
              }}
            />
          </div>
        </div>

        {/* Grid of avatars */}
        <div className="grid grid-cols-5 gap-3 justify-items-center">
          {avatars.map((avatar) => (
            <div
              key={avatar}
              onClick={() => openFullscreenPreview(avatar)}
              className={`
                w-12 h-12 rounded-full overflow-hidden cursor-pointer
                ${selected === avatar 
                  ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' 
                  : 'hover:ring-1 hover:ring-indigo-300 hover:scale-105'}
                transition-all duration-200
              `}
            >
              <img
                src={`/avatars/${avatar}`}
                alt={`Avatar option`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${avatar}&background=random`;
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center">
          <div className="relative flex flex-col items-center">
            {/* Large Preview */}
            <div className="w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-8">
              <img
                src={`/avatars/${previewAvatar}`}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${previewAvatar}&background=random&size=400`;
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={selectAndClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Select This Avatar
              </button>
              <button
                onClick={() => setIsFullscreenOpen(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Scrollable Avatar Row */}
            <div className="mt-8 flex gap-4 overflow-x-auto p-4 max-w-full">
              {avatars.map((avatar) => (
                <div
                  key={avatar}
                  onClick={() => setPreviewAvatar(avatar)}
                  className={`
                    w-16 h-16 flex-shrink-0 rounded-full overflow-hidden cursor-pointer
                    ${previewAvatar === avatar 
                      ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' 
                      : 'hover:ring-1 hover:ring-indigo-300 hover:scale-105'} 
                    transition-all duration-200
                  `}
                >
                  <img
                    src={`/avatars/${avatar}`}
                    alt={`Avatar option`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${avatar}&background=random`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
