import { ReactNode } from "react";
import StandardButton, { StandardButtonProps } from "./StandardButton";
import commonStyles from "../Styles/common.module.css";
import { IoMdAdd } from "react-icons/io";

export default function AddButton(props: StandardButtonProps): ReactNode {
  return (
    <StandardButton {...props}>
      <div className={commonStyles.container}>
        <IoMdAdd />
        {props.children}
      </div>
    </StandardButton>
  );
}
