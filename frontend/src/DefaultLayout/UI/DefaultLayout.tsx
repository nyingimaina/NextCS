import { PureComponent } from "react";
import styles from "../Style/DefaultLayout.module.css";

interface IProps {
  children: React.ReactNode;
  title: string;
}

export default class DefaultLayout extends PureComponent<IProps> {
  componentDidMount(): void {
    document.title = `${this.props.title}`;
  }
  render() {
    return (
      <div className={styles.layout}>
        <h1 className={styles.header}>{this.props.title}</h1>
        <div className={styles.content}>{this.props.children}</div>
      </div>
    );
  }
}
