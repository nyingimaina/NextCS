import React, { CSSProperties, useState } from "react";
import styles from "../Styles/StandardButton.module.css";

type ButtonVariant =
  | "primary"
  | "outlinePrimary"
  | "secondary"
  | "check"
  | "active"
  | "show"
  | "warning"
  | "success";

export interface StandardButtonProps {
  onClick?: () => void | Promise<void>; // Supports async functions
  children: React.ReactNode;
  disabled?: boolean;
  type?: ButtonVariant;
  width?: string;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const StandardButton: React.FC<StandardButtonProps> = ({
  onClick,
  children,
  disabled,
  type,
  width,
}) => {
  const effectiveType = `button${capitalize(type ?? "primary")}`;
  const [isWorking, setIsWorking] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isWorking) return; // Prevent multiple clicks
    setIsWorking(true);

    try {
      e.stopPropagation();
      if (onClick) {
        await onClick(); // Ensure async functions complete before enabling button
      }
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <button
      className={`${styles.button} ${styles[effectiveType]}`}
      onClick={handleClick}
      disabled={disabled || isWorking}
      style={{ width } as CSSProperties}
    >
      {children}
    </button>
  );
};

export default StandardButton;
