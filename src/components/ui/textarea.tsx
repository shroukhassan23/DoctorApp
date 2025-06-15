import * as React from "react"
import { cn } from "@/lib/utils"
import { MessageSquare, Type, AlignLeft } from "lucide-react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  maxHeight?: number;
  showCharacterCount?: boolean;
  maxLength?: number;
}

// Base Enhanced Textarea
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, maxHeight = 300, showCharacterCount = false, maxLength, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [characterCount, setCharacterCount] = React.useState(0);

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea && autoResize) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    }, [autoResize, maxHeight]);

    // Handle input changes
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharacterCount || maxLength) {
        setCharacterCount(e.target.value.length);
      }
      adjustHeight();
      props.onChange?.(e);
    };

    // Initial height adjustment
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight]);

    const isOverLimit = maxLength && characterCount > maxLength;

    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          className={cn(
            // Base styles
            "flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm",
            // Typography
            "font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal leading-relaxed",
            // Focus states
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            // Hover states
            "hover:border-gray-400 transition-all duration-200 ease-in-out",
            // Shadow and depth
            "shadow-sm hover:shadow-md focus:shadow-lg",
            // Disabled states
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 disabled:border-gray-200",
            // Resize behavior
            autoResize ? "resize-none overflow-hidden" : "resize-y",
            // Error state for character limit
            isOverLimit && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          style={{
            maxHeight: autoResize ? `${maxHeight}px` : undefined,
            ...props.style
          }}
          onChange={handleInput}
          {...props}
        />
        
        {/* Character count */}
        {(showCharacterCount || maxLength) && (
          <div className="absolute bottom-3 right-3 text-xs font-medium">
            <span className={cn(
              "px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border",
              isOverLimit ? "text-red-600 border-red-300 bg-red-50/80" : "text-gray-500 border-gray-200"
            )}>
              {characterCount}{maxLength && `/${maxLength}`}
            </span>
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

// Floating Label Textarea
const FloatingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps & { label: string }
>(({ className, label, id, autoResize = true, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useImperativeHandle(ref, () => textareaRef.current!);
  
  const textareaId = id || `floating-textarea-${React.useId()}`;
  
  // Auto-resize functionality
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea && autoResize) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 300);
      textarea.style.height = `${newHeight}px`;
    }
  }, [autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(e.target.value !== '');
    adjustHeight();
    props.onChange?.(e);
  };

  React.useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);
  
  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        id={textareaId}
        className={cn(
          "peer flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-4 pt-8 pb-3 text-sm font-medium text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          "hover:border-gray-400 transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md focus:shadow-lg",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 disabled:border-gray-200",
          "placeholder-transparent leading-relaxed",
          autoResize ? "resize-none overflow-hidden" : "resize-y",
          className
        )}
        placeholder={label}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value !== '');
          props.onBlur?.(e);
        }}
        onChange={handleChange}
        {...props}
      />
      <label
        htmlFor={textareaId}
        className={cn(
          "absolute left-4 top-6 text-gray-500 transition-all duration-200 ease-in-out",
          "peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500",
          "peer-focus:top-3 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium",
          (hasValue || isFocused) && "top-3 text-xs text-blue-600 font-medium",
          "pointer-events-none select-none"
        )}
      >
        {label}
      </label>
    </div>
  );
});
FloatingTextarea.displayName = "FloatingTextarea";

// Rich Textarea with toolbar-like appearance
const RichTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps & { 
    icon?: React.ReactNode;
    title?: string;
    description?: string;
  }
>(({ className, icon, title, description, ...props }, ref) => {
  return (
    <div className="w-full">
      {(title || description) && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-gray-600">{icon}</div>}
            {title && <h4 className="text-sm font-semibold text-gray-900">{title}</h4>}
          </div>
          {description && (
            <p className="text-xs text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="border border-gray-300 rounded-lg shadow-sm bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
        {/* Toolbar-like header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50/50 rounded-t-lg">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Type className="h-3 w-3" />
            <span>Rich Text</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
        
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[120px] p-4 text-sm font-medium text-gray-900 placeholder:text-gray-500",
            "focus:outline-none bg-transparent resize-none leading-relaxed",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
});
RichTextarea.displayName = "RichTextarea";

// Minimal Textarea with clean design
const MinimalTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[100px] p-0 text-sm font-medium text-gray-900 placeholder:text-gray-400",
        "border-0 border-b-2 border-gray-200 rounded-none bg-transparent resize-none",
        "focus:outline-none focus:border-blue-500 transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});
MinimalTextarea.displayName = "MinimalTextarea";

// Comment-style Textarea
const CommentTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps & { 
    avatar?: string;
    placeholder?: string;
  }
>(({ className, avatar, placeholder = "Write a comment...", ...props }, ref) => {
  return (
    <div className="flex gap-3">
      {avatar && (
        <div className="flex-shrink-0">
          <img 
            src={avatar} 
            alt="User avatar" 
            className="w-8 h-8 rounded-full border-2 border-gray-200" 
          />
        </div>
      )}
      {!avatar && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-gray-500" />
        </div>
      )}
      
      <div className="flex-1">
        <textarea
          ref={ref}
          placeholder={placeholder}
          className={cn(
            "w-full min-h-[80px] p-3 text-sm font-medium text-gray-900 placeholder:text-gray-500",
            "border border-gray-300 rounded-lg bg-white resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            "hover:border-gray-400 transition-all duration-200 ease-in-out",
            "shadow-sm hover:shadow-md focus:shadow-lg",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
});
CommentTextarea.displayName = "CommentTextarea";

// Textarea variants
const TextareaVariants = {
  default: "",
  error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-900 placeholder:text-red-400",
  success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
  warning: "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20",
  ghost: "border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-gray-300",
  bordered: "border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500"
}

// Textarea sizes
const TextareaSizes = {
  sm: "min-h-[60px] px-3 py-2 text-xs",
  md: "min-h-[100px] px-4 py-3 text-sm", // default
  lg: "min-h-[140px] px-5 py-4 text-base",
  xl: "min-h-[180px] px-6 py-5 text-lg"
}

export {
  Textarea,
  FloatingTextarea,
  RichTextarea,
  MinimalTextarea,
  CommentTextarea,
  TextareaVariants,
  TextareaSizes,
}