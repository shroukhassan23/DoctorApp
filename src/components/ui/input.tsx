import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Search, X } from "lucide-react"

// Base Input Component
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm",
          // Typography
          "font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          // Hover states
          "hover:border-gray-400 transition-all duration-200 ease-in-out",
          // Shadow and depth
          "shadow-sm hover:shadow-md focus:shadow-lg",
          // Disabled states
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 disabled:border-gray-200",
          // File input specific
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700",
          // Responsive
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Enhanced Input with floating label
const FloatingInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { label: string }
>(({ className, type, label, id, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)
  
  const inputId = id || `floating-input-${React.useId()}`
  
  return (
    <div className="relative">
      <input
        type={type}
        id={inputId}
        className={cn(
          "peer flex h-14 w-full rounded-lg border border-gray-300 bg-white px-4 pt-6 pb-2 text-sm font-medium text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          "hover:border-gray-400 transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md focus:shadow-lg",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 disabled:border-gray-200",
          "placeholder-transparent",
          className
        )}
        placeholder={label}
        ref={ref}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          setHasValue(e.target.value !== '')
          props.onBlur?.(e)
        }}
        onChange={(e) => {
          setHasValue(e.target.value !== '')
          props.onChange?.(e)
        }}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "absolute left-4 top-4 text-gray-500 transition-all duration-200 ease-in-out",
          "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500",
          "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium",
          (hasValue || isFocused) && "top-2 text-xs text-blue-600 font-medium",
          "pointer-events-none select-none"
        )}
      >
        {label}
      </label>
    </div>
  )
})
FloatingInput.displayName = "FloatingInput"

// Password Input with toggle visibility
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className={cn(
          "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm",
          "font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          "hover:border-gray-400 transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md focus:shadow-lg",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 disabled:border-gray-200",
          className
        )}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-blue-600 transition-colors duration-200"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  )
})
PasswordInput.displayName = "PasswordInput"

// Search Input with icon and clear button
const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { 
    onClear?: () => void;
    showClearButton?: boolean;
  }
>(({ className, onClear, showClearButton = true, ...props }, ref) => {
  const [value, setValue] = React.useState(props.value || "")
  
  const handleClear = () => {
    setValue("")
    onClear?.()
    if (props.onChange) {
      const event = {
        target: { value: "" }
      } as React.ChangeEvent<HTMLInputElement>
      props.onChange(event)
    }
  }
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        type="search"
        className={cn(
          "flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm",
          "font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          "hover:border-gray-400 transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md focus:shadow-lg",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 disabled:border-gray-200",
          className
        )}
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          props.onChange?.(e)
        }}
        {...props}
      />
      {showClearButton && value && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-red-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
          onClick={handleClear}
          tabIndex={-1}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})
SearchInput.displayName = "SearchInput"

// Input with icon
const IconInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { 
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
  }
>(({ className, icon, iconPosition = "left", ...props }, ref) => {
  return (
    <div className="relative">
      {icon && iconPosition === "left" && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "flex h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm",
          "font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          "hover:border-gray-400 transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md focus:shadow-lg",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 disabled:border-gray-200",
          icon && iconPosition === "left" ? "pl-10 pr-4" : icon && iconPosition === "right" ? "pl-4 pr-10" : "px-4",
          className
        )}
        ref={ref}
        {...props}
      />
      {icon && iconPosition === "right" && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      )}
    </div>
  )
})
IconInput.displayName = "IconInput"

// Input group for combining inputs with addons
const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex w-full items-stretch", className)}
    {...props}
  >
    {children}
  </div>
))
InputGroup.displayName = "InputGroup"

const InputAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { position: "left" | "right" }
>(({ className, position, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300",
      position === "left" ? "rounded-l-lg border-r-0" : "rounded-r-lg border-l-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
InputAddon.displayName = "InputAddon"

// Input variants
const InputVariants = {
  default: "",
  error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-900 placeholder:text-red-400",
  success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
  warning: "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20",
  ghost: "border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-gray-300",
  minimal: "border-0 border-b-2 rounded-none bg-transparent px-0 shadow-none hover:shadow-none focus:shadow-none"
}

// Input sizes
const InputSizes = {
  sm: "h-9 px-3 py-1.5 text-xs",
  md: "h-11 px-4 py-2.5 text-sm", // default
  lg: "h-13 px-5 py-3 text-base",
  xl: "h-16 px-6 py-4 text-lg"
}

export {
  Input,
  FloatingInput,
  PasswordInput,
  SearchInput,
  IconInput,
  InputGroup,
  InputAddon,
  InputVariants,
  InputSizes,
}