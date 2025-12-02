import React from "react";
import styles from "../Styles/Disabled.module.css";

interface DisabledProps {
  disabled: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

const Disabled: React.FC<DisabledProps> = ({ disabled, tooltip, children }) => {
  if (!disabled) return <>{children}</>;

  return (
    <div className={styles.disabledContainer} title={tooltip}>
      {children}
    </div>
  );
};

export default Disabled;
