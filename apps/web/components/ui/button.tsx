import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-tight interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-soft hover:bg-primary-700 hover:shadow-elevated',
        default:
          'bg-primary text-primary-foreground shadow-soft hover:bg-primary-700 hover:shadow-elevated',
        accent:
          'bg-accent text-accent-foreground shadow-soft hover:bg-accent-600 hover:shadow-elevated',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-primary-100 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700',
        outline:
          'border border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary-50/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800',
        ghost:
          'bg-transparent text-foreground hover:bg-secondary dark:text-slate-100 dark:hover:bg-slate-800',
        link:
          'h-auto rounded-none bg-transparent p-0 font-medium text-primary underline-offset-4 hover:underline',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90',
        success:
          'bg-success text-success-foreground shadow-soft hover:bg-success/90',
      },
      size: {
        sm: 'h-9 min-h-9 min-w-9 px-3.5 text-[13px]',
        default: 'h-11 min-h-11 min-w-11 px-5',
        lg: 'h-12 min-h-12 min-w-12 px-6 text-base',
        icon: 'h-10 w-10 min-h-10 min-w-10 p-0',
      },
    },
    compoundVariants: [
      { variant: 'link', size: 'sm', class: 'h-auto min-h-0 min-w-0 p-0' },
      { variant: 'link', size: 'default', class: 'h-auto min-h-0 min-w-0 p-0' },
      { variant: 'link', size: 'lg', class: 'h-auto min-h-0 min-w-0 p-0' },
    ],
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      const child = Children.only(children) as ReactElement<{ className?: string }>;
      if (isValidElement(child)) {
        return cloneElement(child, {
          className: cn(classes, child.props.className),
          ...(props as Record<string, unknown>),
        });
      }
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
