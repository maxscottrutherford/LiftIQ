"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Context for passing value and onChange to child components
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

// Root component - maintains API compatibility
interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  defaultValue?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ value, onValueChange, children, defaultValue, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const currentValue = value !== undefined ? value : internalValue
    const handleChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    // Extract children to build native select
    const childrenArray = React.Children.toArray(children)
    const trigger = childrenArray.find((child: any) => child?.type === SelectTrigger) as React.ReactElement<any> | undefined
    const content = childrenArray.find((child: any) => child?.type === SelectContent) as React.ReactElement<any> | undefined
    
    // Extract items from SelectContent
    const items: { value: string; children: React.ReactNode }[] = []
    if (content && React.isValidElement(content)) {
      const contentProps = content.props as { children?: React.ReactNode }
      const contentChildren = contentProps?.children
      if (contentChildren) {
        React.Children.forEach(contentChildren, (item: any) => {
          if (item?.type === SelectItem && item.props?.value !== undefined) {
            items.push({
              value: item.props.value,
              children: item.props.children
            })
          }
        })
      }
    }

    // Extract placeholder from SelectValue
    let placeholder: string | undefined
    if (trigger && React.isValidElement(trigger)) {
      const triggerProps = trigger.props as { children?: React.ReactNode }
      const triggerChildren = triggerProps?.children
      if (triggerChildren) {
        React.Children.forEach(triggerChildren, (child: any) => {
          if (child?.type === SelectValue && child.props?.placeholder) {
            placeholder = child.props.placeholder
          }
        })
      }
    }

    // Get className and id from SelectTrigger
    const triggerProps = trigger && React.isValidElement(trigger) ? trigger.props as { className?: string; id?: string } : {}
    const className = triggerProps?.className || ""
    const id = triggerProps?.id || undefined

    return (
      <SelectContext.Provider value={{ value: currentValue, onValueChange: handleChange, placeholder }}>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            value={currentValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(
              "h-11 min-h-[44px] w-full rounded-md border border-input bg-background px-3.5 py-2.5 pr-10 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer appearance-none touch-manipulation",
              className
            )}
            {...props}
          >
            {placeholder && !currentValue && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {items.map((item) => (
              <option key={item.value} value={item.value}>
                {item.children}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

// Placeholder components for API compatibility (no-op renderers)
const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
)
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.forwardRef<HTMLSpanElement, { placeholder?: string; children?: React.ReactNode }>(
  ({ placeholder, children, ...props }, ref) => null
)
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { id?: string }>(
  ({ children, className, id, ...props }, ref) => null
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => null
)
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  )
)
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<HTMLOptionElement, { value: string; children: React.ReactNode; disabled?: boolean }>(
  ({ value, children, disabled, ...props }, ref) => null
)
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
)
SelectSeparator.displayName = "SelectSeparator"

// No-op components for scroll buttons (not needed for native select)
const SelectScrollUpButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => null
)
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => null
)
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
