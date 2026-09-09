import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface KuotaIndicatorProps {
  used: number;
  remaining: number;
  total: number;
  compact?: boolean;
}

export function KuotaIndicator({ used, remaining, total, compact = false }: KuotaIndicatorProps) {
  const percentage = (used / total) * 100;
  const isLow = remaining <= 3;
  const isEmpty = remaining === 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isEmpty ? (
          <AlertCircle className="h-4 w-4 text-status-error" />
        ) : remaining <= 3 ? (
          <AlertCircle className="h-4 w-4 text-status-warning" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-status-success" />
        )}
        <span className={cn(
          'text-sm font-medium',
          isEmpty && 'text-status-error',
          isLow && !isEmpty && 'text-status-warning'
        )}>
          Kuota: {remaining}/{total}
        </span>
      </div>
    );
  }

  return (
    <Card className={cn(isEmpty && 'border-status-error')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Kuota Cuti Tahunan</span>
          {isEmpty ? (
            <AlertCircle className="h-5 w-5 text-status-error" />
          ) : remaining <= 3 ? (
            <AlertCircle className="h-5 w-5 text-status-warning" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-status-success" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{remaining}</span>
            <span className="text-sm text-muted-foreground">hari tersisa dari {total}</span>
          </div>
          <Progress
            value={percentage}
            variant={isEmpty ? 'error' : isLow ? 'warning' : 'default'}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {used} hari telah digunakan
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
