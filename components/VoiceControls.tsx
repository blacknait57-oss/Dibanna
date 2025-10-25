import React from 'react';

interface VoiceControlsProps {
    channelName: string;
    isMuted: boolean;
    isDeafened: boolean;
    onToggleMute: () => void;
    onToggleDeafen: () => void;
    onDisconnect: () => void;
}

const MuteIcon: React.FC<{ isMuted: boolean }> = ({ isMuted }) => (
    <div className="relative w-5 h-5">
        <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A8.001 8.001 0 012 8V7a1 1 0 011-1h2a1 1 0 011 1v1a5 5 0 0010 0v-1a1 1 0 011-1h2a1 1 0 011 1v1a8.001 8.001 0 01-9 6.93z" clipRule="evenodd"></path></svg>
        {isMuted && <div className="absolute inset-0 flex items-center justify-center"><svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.5 4.5l15 15"></path></svg></div>}
    </div>
);

const DeafenIcon: React.FC<{ isDeafened: boolean }> = ({ isDeafened }) => (
    <div className="relative w-5 h-5">
        <svg fill="currentColor" viewBox="0 0 20 20"><path d="M18 8a6 6 0 00-12 0v1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2v1a6 6 0 1012 0v-1h2a1 1 0 001-1V9a1 1 0 00-1-1h-2V8z"></path></svg>
        {isDeafened && <div className="absolute inset-0 flex items-center justify-center"><svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.5 4.5l15 15"></path></svg></div>}
    </div>
);


const DisconnectIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
);


const VoiceControls: React.FC<VoiceControlsProps> = ({ channelName, isMuted, isDeafened, onToggleMute, onToggleDeafen, onDisconnect }) => {
    return (
        <div className="p-2 bg-gray-800 border-t border-gray-900/50">
            <div>
                <span className="text-xs font-bold text-green-400">VOICE CONNECTED</span>
                <p className="text-sm text-gray-300 truncate">{channelName}</p>
            </div>
            <div className="flex items-center justify-center space-x-3 mt-2">
                <button onClick={onToggleMute} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
                    <MuteIcon isMuted={isMuted} />
                </button>
                 <button onClick={onToggleDeafen} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors" aria-label={isDeafened ? "Undeafen" : "Deafen"}>
                    <DeafenIcon isDeafened={isDeafened} />
                </button>
                <button onClick={onDisconnect} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors" aria-label="Disconnect">
                   <DisconnectIcon />
                </button>
            </div>
        </div>
    );
};

export default VoiceControls;
