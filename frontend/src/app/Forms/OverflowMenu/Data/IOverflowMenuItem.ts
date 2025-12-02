import { ReactNode } from "react";

export default interface IOverflowMenuItem {
  content: ReactNode;
  onClick?: () => void;
}
