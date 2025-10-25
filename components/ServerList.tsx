
import React from 'react';
import type { Server } from '../types';

interface ServerListProps {
  servers: Server[];
  selectedServerId: string;
  onServerSelect: (serverId: string) => void;
  onAddServerClick: () => void;
}

const ServerIcon: React.FC<{ 
  server: Server, 
  isSelected: boolean, 
  onClick: () => void 
}> = ({ server, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const baseClasses = "relative flex items-center justify-center h-12 w-12 transition-all duration-200 ease-in-out cursor-pointer group";
  
  const shapeClasses = isSelected || isHovered
    ? "rounded-2xl" 
    : "rounded-full";
  
  const bgClasses = server.imageUrl ? "" : "bg-gray-800";
    
  const activeBarClass = isSelected 
    ? "absolute -left-0 top-1/2 -translate-y-1/2 h-10 w-1 bg-white rounded-r-full" 
    : isHovered 
    ? "absolute -left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full transition-all duration-200"
    : "";

  const iconStyle = {
      backgroundColor: isSelected || isHovered ? 'var(--accent-color)' : ''
  };

  return (
    <div className="relative mb-2">
       <div className={activeBarClass}></div>
       <div 
         className={`${baseClasses} ${shapeClasses} ${bgClasses}`}
         style={!server.imageUrl ? iconStyle : {}}
         onClick={onClick}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
       >
         {server.imageUrl && <img src={server.imageUrl} alt={server.name} className={`h-full w-full object-cover ${shapeClasses} transition-all duration-200`} />}
         {server.icon && <div className={`transition-colors duration-200 ${isSelected ? 'text-white' : 'text-green-300 group-hover:text-white'}`}>{server.icon}</div>}
         
         <div className="absolute left-16 w-max p-2 px-3 text-sm font-semibold text-white bg-black rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
           {server.name}
         </div>
       </div>
    </div>
  );
};

const ServerList: React.FC<ServerListProps> = ({ servers, selectedServerId, onServerSelect, onAddServerClick }) => {
  const addServerButton = { id: 'add', name: 'Add a Server', icon: React.createElement('span', { className: "text-xl font-light" }, '+'), memberIds:[] };

  return (
    <div className="flex flex-col items-center p-3 space-y-2 bg-gray-900 overflow-y-auto">
      <ServerIcon 
        server={servers.find(s => s.id === 'dm')!}
        isSelected={selectedServerId === 'dm'}
        onClick={() => onServerSelect('dm')}
      />

      <div className="h-px w-8 bg-gray-700 my-2"></div>
      
      {servers.filter(s => s.id !== 'dm').map((server) => (
        <ServerIcon 
          key={server.id}
          server={server} 
          isSelected={server.id === selectedServerId}
          onClick={() => onServerSelect(server.id)}
        />
      ))}

      <ServerIcon 
        server={addServerButton}
        isSelected={false}
        onClick={onAddServerClick}
      />
    </div>
  );
};

export default ServerList;