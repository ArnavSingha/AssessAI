
'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  sender: 'user' | 'system';
  text: string;
}

export function ChatMessage({ sender, text }: ChatMessageProps) {
  const isUser = sender === 'user';
  return (
    <div
      className={cn(
        'flex items-start gap-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg p-3 text-sm whitespace-pre-wrap',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {text}
      </div>
      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

interface MCQChatMessageProps {
  text: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
}

export function MCQChatMessage({
  text,
  options,
  selectedOption,
  onSelect,
}: MCQChatMessageProps) {
  return (
    <div className="flex items-start gap-4 justify-start">
      <Avatar className="w-8 h-8">
        <AvatarFallback>
          <Bot />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-md rounded-lg p-3 text-sm bg-muted text-muted-foreground">
        <p className="whitespace-pre-wrap mb-3">{text}</p>
        <div className="flex flex-col space-y-2">
          {options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === option ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => onSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
