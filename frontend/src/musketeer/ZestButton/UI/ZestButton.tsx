import React, { useState, useEffect, useRef } from "react";
import { FaSpinner } from "react-icons/fa";
import styles from "../Styles/ZestButton.module.css";

// --- Types ---

export type ZestVariant = "standard" | "success" | "danger";
export type ZestSize = "sm" | "md" | "lg";

/**
 * Visual appearance of the button
 */
interface VisualOptions {
  variant?: ZestVariant;
  size?: ZestSize;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

/**
 * Behavior during async operations
 */
interface BusyOptions {
  handleInternally?: boolean;
  preventRageClick?: boolean;
  minBusyDurationMs?: number;
}

/**
 * Behavior after a successful or failed click
 */
interface SuccessOptions {
  showCheckmark?: boolean;
  showFailIcon?: boolean;
  autoResetAfterMs?: number;
}

interface ConfirmOptions {
  displayLabel: string;
  timeoutSecs: number;
}

/**
 * All supported props
 */
export interface ZestButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  visualOptions?: VisualOptions;
  busyOptions?: BusyOptions;
  successOptions?: SuccessOptions;
  confirmOptions?: ConfirmOptions;
  isDefault?: boolean;
}

// --- Components ---

const AnimatedCheckmark: React.FC = () => (
  <svg
    className={styles.animatedCheck}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const AnimatedX: React.FC = () => (
  <svg
    className={styles.animatedX}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 6L18 18" />
    <path d="M6 18L18 6" />
  </svg>
);

const ZestButton: React.FC<ZestButtonProps> = ({
  visualOptions = {},
  busyOptions = {},
  successOptions = {},
  isDefault = false,
  className = "",
  disabled,
  children,
  onClick,
  ...props
}) => {
  const {
    variant = "standard",
    size = "md",
    fullWidth = false,
    iconLeft,
    iconRight,
  } = visualOptions;

  const {
    handleInternally = true,
    preventRageClick = true,
    minBusyDurationMs = 500,
  } = busyOptions;

  const {
    showCheckmark = true,
    showFailIcon = true,
    autoResetAfterMs = 2000,
  } = successOptions;

  const [internalBusy, setInternalBusy] = useState(false);
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [wasFailed, setWasFailed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [currentChildren, setCurrentChildren] =
    useState<React.ReactNode>(children);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  // ✅ interval ref for confirm countdown
  const confirmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // keep children in sync when not in confirm mode
  useEffect(() => {
    if (!awaitingConfirm) {
      setCurrentChildren(children);
    }
  }, [children, awaitingConfirm]);

  const effectiveBusy =
    typeof props["aria-busy"] === "boolean"
      ? Boolean(props["aria-busy"])
      : handleInternally
      ? internalBusy
      : false;

  const isDisabled =
    disabled ||
    effectiveBusy ||
    (preventRageClick && (wasSuccessful || wasFailed));

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (preventRageClick && internalBusy) return;

    if (handleInternally && typeof onClick === "function") {
      try {
        setWasSuccessful(false);
        setWasFailed(false);
        setInternalBusy(true);
        const startTime = Date.now();

        await onClick(e);

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(minBusyDurationMs - elapsed, 0);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        if (showCheckmark) setWasSuccessful(true);
      } catch (err) {
        console.error(err);
        if (showFailIcon) setWasFailed(true);
      } finally {
        setInternalBusy(false);
      }
    } else if (onClick) {
      onClick(e);
    }
  };

  // auto-reset success/failure state
  useEffect(() => {
    if ((wasSuccessful || wasFailed) && autoResetAfterMs) {
      const timeout = setTimeout(() => {
        setWasSuccessful(false);
        setWasFailed(false);
      }, autoResetAfterMs);
      return () => clearTimeout(timeout);
    }
  }, [wasSuccessful, wasFailed, autoResetAfterMs]);

  // Enter key handler if isDefault
  useEffect(() => {
    if (!isDefault || isDisabled) return;
    const listener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.key === "Enter" &&
        !e.repeat &&
        !e.defaultPrevented &&
        !(target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        buttonRef.current?.click();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [isDefault, isDisabled]);

  const stopWaiting = () => {
    if (confirmIntervalRef.current) {
      clearInterval(confirmIntervalRef.current);
      confirmIntervalRef.current = null;
    }
    setCurrentChildren(children);
    setAwaitingConfirm(false);
  };

  const handleConfirmClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!props.confirmOptions) {
      return handleClick(e);
    }

    if (awaitingConfirm) {
      stopWaiting();
      return handleClick(e);
    }

    const { displayLabel, timeoutSecs } = props.confirmOptions;
    const startTime = Date.now();
    setAwaitingConfirm(true);

    confirmIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutSecs * 1000) {
        stopWaiting();
      } else {
        const elapsedSecs = Math.floor(elapsed / 1000);
        const timeRemaining = timeoutSecs - elapsedSecs;
        setCurrentChildren(`${displayLabel} (${timeRemaining}s)`);
      }
    }, 100); // ✅ update once per second
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (confirmIntervalRef.current) {
        clearInterval(confirmIntervalRef.current);
      }
    };
  }, []);

  const renderLeftIcon = () => {
    if (effectiveBusy) {
      return (
        <span className={`${styles.icon} ${styles.fadeIn}`}>
          <FaSpinner className={styles.spinner} />
        </span>
      );
    } else if (wasSuccessful && showCheckmark) {
      return (
        <span className={`${styles.icon} ${styles.fadeIn}`}>
          <AnimatedCheckmark />
        </span>
      );
    } else if (wasFailed && showFailIcon) {
      return (
        <span className={`${styles.icon} ${styles.fadeIn} ${styles.failShake}`}>
          <AnimatedX />
        </span>
      );
    } else if (iconLeft) {
      return <span className={styles.icon}>{iconLeft}</span>;
    }
    return null;
  };

  return (
    <button
      ref={buttonRef}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : "",
        isDisabled ? styles.disabled : "",
        wasFailed ? styles.failGlow : "",
        className,
      ].join(" ")}
      disabled={isDisabled}
      aria-busy={effectiveBusy}
      onClick={handleConfirmClick}
      {...props}
    >
      <span className={styles.inner}>
        {renderLeftIcon()}
        <span className={styles.content}>
          {currentChildren}
          {iconRight && <span className={styles.icon}>{iconRight}</span>}
        </span>
      </span>
    </button>
  );
};

export default ZestButton;
