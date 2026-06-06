import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';

// Form
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function Form({ className, children, ...props }: FormProps) {
  return (
    <form className={cn('space-y-4', className)} {...props}>
      {children}
    </form>
  );
}

// Form Group
interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormGroup({ className, children, ...props }: FormGroupProps) {
  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
}

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function FormLabel({ className, children, ...props }: FormLabelProps) {
  return (
    <label
      className={cn('text-sm font-medium text-zinc-300 block', className)}
      {...props}
    >
      {children}
    </label>
  );
}

// Form Input
type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className,
        )}
        {...props}
      />
    );
  },
);
FormInput.displayName = 'FormInput';

// Form Error
interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function FormError({ className, children, ...props }: FormErrorProps) {
  return (
    <p className={cn('text-xs font-medium text-red-400', className)} {...props}>
      {children}
    </p>
  );
}
