import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundControllerProps {
  isMuted: boolean;
  onToggle: () => void;
}

export const SoundController: React.FC<SoundControllerProps> = ({ isMuted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#D6B15B]/30 bg-[#06170E]/70 backdrop-blur-md text-[#F7F1E3] hover:text-[#F6D88B] hover:border-[#D6B15B]/60 transition-all duration-300 shadow-lg cursor-pointer group select-none"
      title={isMuted ? 'Enable Cinematic Audio (M)' : 'Mute Audio (M)'}
      aria-label={isMuted ? 'Sound Off - Click to enable sound' : 'Sound On - Click to mute'}
    >
      {isMuted ? (
        <VolumeX className="w-3.5 h-3.5 text-[#F7F1E3]/60 group-hover:text-[#F6D88B]" />
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-[#F6D88B] animate-pulse" />
      )}

      <span className="text-[11px] font-medium tracking-widest uppercase text-[#F7F1E3]/80 group-hover:text-[#F6D88B]">
        {isMuted ? 'Sound Off' : 'Sound On'}
      </span>

      {/* Animated Sound Wave Bars when unmuted */}
      {!isMuted && (
        <div className="flex items-center gap-0.5 ml-1">
          <span className="w-0.5 h-2 bg-[#F6D88B] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-0.5 h-3.5 bg-[#F6D88B] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-0.5 h-2 bg-[#F6D88B] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </button>
  );
};
