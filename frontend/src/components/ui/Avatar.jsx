import { useState } from 'react';

export function Avatar({ 
  user, 
  size = 'md', 
  className = '',
  showFallback = true 
}) {
  const [imageError, setImageError] = useState(false);
  
  // Size configurations
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-xl'
  };
  
  // Get avatar URL (priority: LeetCode avatar, then general avatar)
  const avatarUrl = user?.leetcodeData?.userAvatar || user?.avatar;
  
  // Generate initials from displayName or name
  const getInitials = () => {
    const name = user?.displayName || user?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };
  
  const shouldShowImage = avatarUrl && !imageError;
  
  return (
    <div className={`
      ${sizeClasses[size]} 
      rounded-full 
      bg-[#FF0000] 
      flex 
      items-center 
      justify-center 
      text-white 
      font-bold 
      overflow-hidden
      ${className}
    `}>
      {shouldShowImage ? (
        <img 
          src={avatarUrl} 
          alt={`${user?.displayName || user?.name || 'User'} Avatar`} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : showFallback ? (
        <span className="select-none">
          {getInitials()}
        </span>
      ) : null}
    </div>
  );
}

export default Avatar;
