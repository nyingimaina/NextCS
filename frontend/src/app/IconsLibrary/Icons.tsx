import { ReactNode } from "react";
import { FaEdit } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

export function IconAdd(args?: {
  className?: string;
  onClick?: () => void;
}): ReactNode {
  return (
    <IoIosAddCircleOutline
      className={args?.className}
      onClick={args?.onClick}
      title="Add"
    />
  );
}

export function IconEdit(args?: { className?: string; onClick?: () => void }) {
  return <FaEdit className={args?.className} onClick={args?.onClick} />;
}

export function IconDelete(args?: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <MdDeleteForever className={args?.className} onClick={args?.onClick} />
  );
}
