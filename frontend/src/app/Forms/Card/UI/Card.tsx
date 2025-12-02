import { ReactNode } from "react";
import styles from "../Styles/Card.module.css";

interface IProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card(props: IProps): ReactNode {
  return (
    <div className={`${styles.card} ${props.className}`}>
      <div className={styles.cardBody}>
        <h6 className={styles.cardTitle}>{props.title}</h6>
        {props.children}
      </div>
    </div>
  );
}
