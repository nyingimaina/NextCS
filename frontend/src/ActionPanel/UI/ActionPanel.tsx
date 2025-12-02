import { ReactNode } from "react";
import styles from "../Styles/ActionPanel.module.css";
export default function ActionPanel(props: {
  children: ReactNode;
  className?: string;
  mode?: "basic" | "full";
}) {
  return (
    <div
      className={`${
        props.mode === "full" ? styles.actionPanel : styles.basicActionPanel
      } ${props.className}`}
    >
      {props.children}
    </div>
  );
}
