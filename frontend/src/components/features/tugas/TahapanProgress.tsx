import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { TahapanTugas } from '@/types';

interface TahapanProgressProps {
  currentTahapan?: TahapanTugas;
  completedTahapan: TahapanTugas[];
}

const stages: { key: TahapanTugas; label: string }[] = [
  { key: 'Before', label: 'Before' },
  { key: 'Ongoing', label: 'Ongoing' },
  { key: 'Finished', label: 'Finished' },
];

export function TahapanProgress({ completedTahapan }: TahapanProgressProps) {
  const getStageStatus = (stage: TahapanTugas, index: number) => {
    if (completedTahapan.includes(stage)) return 'completed';
    // Current stage is the first uncompleted one
    const uncompletedIndex = stages.findIndex(s => !completedTahapan.includes(s.key));
    if (index === uncompletedIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-between">
      {stages.map((stage, index) => {
        const status = getStageStatus(stage.key, index);
        const isLast = index === stages.length - 1;

        return (
          <div key={stage.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  status === 'completed' && 'bg-status-success text-white',
                  status === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/30',
                  status === 'pending' && 'bg-muted text-muted-foreground'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {/* Label */}
              <span
                className={cn(
                  'mt-1 text-xs font-medium',
                  status === 'completed' && 'text-status-success',
                  status === 'current' && 'text-primary',
                  status === 'pending' && 'text-muted-foreground'
                )}
              >
                {stage.label}
              </span>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  completedTahapan.includes(stages[index + 1].key) ? 'bg-status-success' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
