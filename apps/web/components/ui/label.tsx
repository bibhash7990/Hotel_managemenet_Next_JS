import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 text-[13px] font-medium leading-none text-foreground/85 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-200',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';
