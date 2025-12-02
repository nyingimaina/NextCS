import React, { useState, useEffect } from "react";
import styles from "../Styles/ZestTextbox.module.css";

export type ZestTextboxSize = "sm" | "md" | "lg";

type SharedProps = {
  zSize?: ZestTextboxSize;
  stretch?: boolean;
  className?: string;
  maxLength?: number;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "color"
    | "date"
    | "datetime-local"
    | "month"
    | "time"
    | "week";
};

type InputOnlyProps = SharedProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> & {
    isMultiline?: false;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  };

type TextareaOnlyProps = SharedProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & {
    isMultiline: true;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  };

type ZestTextboxProps = InputOnlyProps | TextareaOnlyProps;

export const ZestTextbox: React.FC<ZestTextboxProps> = (props) => {
  const {
    zSize = "md",
    stretch: fullWidth = false,
    className = "",
    maxLength,
    onChange,
    ...rest
  } = props;

  const [value, setValue] = useState("");
  const [isDark, setIsDark] = useState(false);

  // === Detect theme changes dynamically ===
  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains("dark"));
    check(); // set initial

    const observer = new MutationObserver(() => check());
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const classList = [
    styles.textbox,
    styles[zSize],
    fullWidth ? styles.fullWidth : "",
    className,
    isDark ? styles.dark : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (maxLength !== undefined && e.target.value.length > maxLength) return;

    setValue(e.target.value);

    if (onChange) onChange(e as never); // cast because it could be input or textarea
  };

  const commonProps = {
    className: classList,
    maxLength,
    onChange: handleInputChange,
    value,
    ...rest,
  };

  const showCounter = typeof maxLength === "number";

  return (
    <div className={styles.wrapper}>
      {"isMultiline" in props && props.isMultiline ? (
        <textarea
          {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          {...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {showCounter && (
        <div className={styles.counter}>
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};
