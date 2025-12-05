"use client";

import * as React from "react";
import clsx from "clsx";

type RadioGroupContextValue = {
  value: string;
  setValue: (val: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

type RadioGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
};

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");

  React.useEffect(() => {
    if (typeof value === "string") {
      setInternal(value);
    }
  }, [value]);

  const setValue = (val: string) => {
    setInternal(val);
    onValueChange?.(val);
  };

  return (
    <RadioGroupContext.Provider value={{ value: internal, setValue }}>
      <div role="radiogroup" className={clsx("space-y-2", className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id?: string;
  value: string;
};

export function RadioGroupItem({ className, id, value, ...props }: RadioGroupItemProps) {
  const ctx = React.useContext(RadioGroupContext);
  const checked = ctx?.value === value;

  return (
    <div className="flex items-center">
      <input
        id={id}
        type="radio"
        className={clsx(
          "h-4 w-4 rounded-full border border-primary text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
          className
        )}
        value={value}
        checked={checked}
        onChange={() => ctx?.setValue(value)}
        {...props}
      />
    </div>
  );
}
