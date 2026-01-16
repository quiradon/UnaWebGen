import React from 'react';

interface EmojiDisplayProps {
  value?: string;
  className?: string;
  defaultEmoji?: string;
}

export const EmojiDisplay: React.FC<EmojiDisplayProps> = ({ value, className, defaultEmoji }) => {
  // Default size if not provided, but allow overriding
  const finalClass = className || 'h-5 w-5';
  
  if (!value) {
    return defaultEmoji ? (
      <span className={`${finalClass} inline-flex items-center justify-center shrink-0`}>
        {defaultEmoji}
      </span>
    ) : null;
  }

  // Regex for Discord custom emojis: <:Name:ID> or <a:Name:ID>
  // Example: <:System3DET:1282445914551746580>
  const discordEmojiRegex = /<(a?):(\w+):(\d+)>/;
  const match = value.match(discordEmojiRegex);

  if (match) {
    const isAnimated = match[1] === 'a';
    const name = match[2];
    const id = match[3];
    // Using the URL pattern provided by the user, but adapting for dynamic ID
    // User example: https://cdn.discordapp.com/emojis/1420675280271573012.webp?size=512&quality=lossless&animated=true
    const url = `https://cdn.discordapp.com/emojis/${id}.webp?size=64&quality=lossless${isAnimated ? '&animated=true' : ''}`;
    
    return (
      <img 
        src={url} 
        alt={name} 
        className={`inline-block object-contain align-middle shrink-0 ${finalClass}`} 
        title={name}
      />
    );
  }

  // For standard emojis, we use inline-flex to center them within the dimensions
  return (
    <span className={`${finalClass} inline-flex items-center justify-center shrink-0`}>
      {value}
    </span>
  );
};
