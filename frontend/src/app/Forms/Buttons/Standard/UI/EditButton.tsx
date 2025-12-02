import { ReactNode } from "react";
import StandardButton, { StandardButtonProps } from "./StandardButton";
import commonStyles from "../Styles/common.module.css";
import { CiEdit } from "react-icons/ci";

export default function EditButton(props: StandardButtonProps): ReactNode {
  return (
    <StandardButton {...props}>
      <div className={commonStyles.container}>
        <CiEdit />
        {props.children}
      </div>
    </StandardButton>
  );
}
