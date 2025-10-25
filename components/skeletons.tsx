import React from 'react';

const SkeletonBase: React.FC<{ className?: string }> = ({ className }) => <div className={`bg-gray-600/50 rounded ${className || ''}`}></div>;

const MessageSkeleton: React.FC = () => (
    <div className="flex space-x-4 p-4">
        <div className="w-10 h-10 bg-gray-600/50 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-1/4" />
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-4 w-1/2" />
        </div>
    </div>
);

export const ChatAreaSkeleton: React.FC = () => (
    <div className="flex-1 flex flex-col justify-end overflow-hidden animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => <MessageSkeleton key={i} />)}
    </div>
);

const ChannelSkeleton: React.FC = () => (
    <div className="flex items-center space-x-2 p-2">
        <SkeletonBase className="w-5 h-5" />
        <SkeletonBase className="h-4 flex-1" />
    </div>
);

export const ChannelListSkeleton: React.FC<{ isDM?: boolean }> = ({ isDM }) => (
    <div className="flex-1 p-2 space-y-2 overflow-hidden animate-pulse">
        {isDM ? (
            <>
                <SkeletonBase className="h-6 w-1/3 mb-4" />
                {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className="flex items-center space-x-2 p-2">
                        <SkeletonBase className="w-8 h-8 rounded-full" />
                        <SkeletonBase className="h-4 flex-1" />
                    </div>
                ))}
            </>
        ) : (
            <>
                <SkeletonBase className="h-6 w-1/3 mb-4" />
                {Array.from({ length: 8 }).map((_, i) => <ChannelSkeleton key={i} />)}
                <SkeletonBase className="h-6 w-1/2 mt-4 mb-2" />
                {Array.from({ length: 3 }).map((_, i) => <ChannelSkeleton key={i} />)}
            </>
        )}
    </div>
);

const UserSkeleton: React.FC = () => (
    <div className="flex items-center space-x-3 p-2">
        <SkeletonBase className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-1.5">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
        </div>
    </div>
);

export const UserListSkeleton: React.FC = () => (
     <div className="flex-1 p-2 space-y-2 overflow-hidden animate-pulse">
         <SkeletonBase className="h-5 w-2/3 mb-4" />
         {Array.from({ length: 12 }).map((_, i) => <UserSkeleton key={i} />)}
     </div>
);
