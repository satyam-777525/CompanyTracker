import * as Progress from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export function ProgressBar({ value = 0, className, showLabel = false }) {
  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
      <Progress.Root
        className="relative h-2 w-full overflow-hidden rounded-full bg-border"
        value={value}
      >
        <Progress.Indicator
          className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </Progress.Root>
    </div>
  );
}
