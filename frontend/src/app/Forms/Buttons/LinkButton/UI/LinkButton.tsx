import { ReactNode, useState } from "react";
import styles from "../Styles/LinkButton.module.css";
interface IProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}
export default function LinkButton(props: IProps) {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const className =
    props.disabled === true || isWorking ? styles.disabled : styles.linkButton;
  return (
    <span
      className={className}
      onClick={async () => {
        if (isWorking) {
          return;
        }
        try {
          setIsWorking(true);
          if (props.onClick) {
            await props.onClick();
          }
        } finally {
          setIsWorking(false);
        }
      }}
    >
      {props.children}
    </span>
  );
}
