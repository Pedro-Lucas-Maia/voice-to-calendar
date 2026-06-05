import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

// Form
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function Form({ className, children, ...props }: FormProps) {
  return (
    <form className={cn("space-y-6", className)} {...props}>
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
    <div className={cn("space-y-2", className)} {...props}>
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
      className={cn(
        "text-sm font-medium text-gray-700 dark:text-gray-300",
        className,
      )}
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
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border-medium dark:bg-[#222222] dark:text-gray-100 dark:placeholder:text-gray-500",
          className,
        )}
        {...props}
      />
    );
  },
);
FormInput.displayName = "FormInput";

// Form Error
interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function FormError({ className, children, ...props }: FormErrorProps) {
  return (
    <p className={cn("text-xs font-medium text-red-500", className)} {...props}>
      {children}
    </p>
  );
}
