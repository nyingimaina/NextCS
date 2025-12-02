import { PureComponent, ReactNode } from "react";
import styles from "../Styles/PasswordSuffix.module.css";
import Image from "next/image";

interface IState {
  passwordVisible: boolean;
}

interface IProps {
  onVisibilityChange: (visible: boolean) => void;
}

export default class PasswordSuffix extends PureComponent<IProps, IState> {
  state = {
    passwordVisible: false,
  };
  render(): ReactNode {
    return (
      <Image
        className={styles.passwordToggle}
        src={this.state.passwordVisible ? "/eye.svg" : "/eye-slash.svg"}
        alt="Password Visibility Toggle"
        width={20}
        height={20}
        onClick={() => {
          this.setState(
            {
              passwordVisible: !this.state.passwordVisible,
            },
            () => {
              this.props.onVisibilityChange(this.state.passwordVisible);
            }
          );
        }}
      />
    );
  }
}
