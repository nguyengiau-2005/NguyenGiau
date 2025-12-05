// Auto-generated: module stubs to satisfy TypeScript until proper dependencies/types are installed

declare module '@radix-ui/*';
declare module '@radix-ui/react-*';
declare module 'class-variance-authority' {
	// Minimal typings to satisfy VariantProps and cva usage in the project
	export type VariantProps<T> = Record<string, any>;
	export function cva(base?: string | string[], config?: any): (...args: any[]) => string;
}
declare module 'clsx';
declare module 'tailwind-merge';
declare module 'next-themes';
declare module 'sonner';
declare module 'react-resizable-panels';
declare module 'react-native-swiper';
declare module 'react-native-linear-gradient';

declare module 'lucide-react';

declare module '*';

// allow VariantProps<T> and other types to be used without importing everywhere
declare global {
  type VariantProps<T = any> = Record<string, any>;
  type ClassValue = string | Record<string, any> | (string | Record<string, any>)[];
  
  // Form types from react-hook-form
  type FieldValues = Record<string, any>;
  type FieldPath<TFieldValues extends FieldValues = FieldValues> = string & keyof TFieldValues;
  interface ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  > {
    name: TName;
    control?: any;
    defaultValue?: any;
    rules?: any;
    shouldUnregister?: boolean;
    render?: any;
  }
  
  // Sonner types
  type ToasterProps = Record<string, any>;
  
  // Embla carousel types
  type UseEmblaCarouselType = [any, Record<string, any>];
}

export { }; // keep this file a module to avoid global leakage

