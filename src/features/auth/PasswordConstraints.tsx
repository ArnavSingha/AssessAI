
'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordConstraintsProps {
  constraints: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    digit: boolean;
    special: boolean;
  };
}

const constraintMessages = [
  { key: 'length', text: 'At least 8 characters' },
  { key: 'lowercase', text: 'A lowercase letter' },
  { key: 'uppercase', text: 'An uppercase letter' },
  { key: 'digit', text: 'A number' },
  { key: 'special', text: 'A special character' },
] as const;

export function PasswordConstraints({ constraints }: PasswordConstraintsProps) {
  return (
    <div className="mt-2 space-y-1">
      {constraintMessages.map(({ key, text }) => {
        const met = constraints[key];
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            {met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={cn(
                'transition-colors',
                met ? 'text-green-500' : 'text-muted-foreground'
              )}
            >
              {text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
