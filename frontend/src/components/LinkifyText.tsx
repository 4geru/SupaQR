import React from 'react';

interface LinkifyTextProps {
  text: string;
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

export default function LinkifyText({ text }: LinkifyTextProps) {
  if (!text) {
    return null;
  }

  const parts = text.split(urlRegex);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
}
