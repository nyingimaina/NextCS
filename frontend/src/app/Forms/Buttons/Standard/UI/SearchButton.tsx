import { ReactNode } from "react";
import StandardButton, { StandardButtonProps } from "./StandardButton";
import { FaSearch } from "react-icons/fa";

import commonStyles from "../Styles/common.module.css";

export default function SearchButton(props: StandardButtonProps): ReactNode {
  return (
    <StandardButton {...props}>
      <div className={commonStyles.container}>
        <FaSearch />
        {props.children}
      </div>
    </StandardButton>
  );
}
