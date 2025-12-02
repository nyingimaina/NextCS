import { ReactNode, useRef } from "react";
import { FaCopy } from "react-icons/fa"; // Standard copy icon from react-icons
import styles from "../Styles/CopyTextWrapper.module.css"; // Import the CSS module

interface CopyTextWrapperProps {
  children: ReactNode;
  onSuccess?: () => void;
  onFailure?: () => void;
}

const CopyTextWrapper = ({
  children,
  onSuccess,
  onFailure,
}: CopyTextWrapperProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      // Clipboard API is supported
      if (divRef.current) {
        const text = divRef.current.innerText;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            if (onSuccess) onSuccess(); // Invoke onSuccess callback
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            if (onFailure) onFailure(); // Invoke onFailure callback
          });
      }
    } else {
      console.warn("Clipboard API is not supported on this browser.");
      if (onFailure) onFailure(); // Invoke onFailure callback
    }
  };

  return (
    <div
      ref={divRef}
      onClick={copyToClipboard}
      className={styles.copyWrapper} // Apply styles from the CSS module
    >
      <FaCopy className={styles.copyIcon} /> {/* Standard copy icon */}
      {children}
    </div>
  );
};

export default CopyTextWrapper;
