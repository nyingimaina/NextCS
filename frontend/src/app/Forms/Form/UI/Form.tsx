import { ChangeEvent, ReactNode } from "react";
import styles from "../Styles/Forms.module.css";

function Form(props: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}): ReactNode {
  return (
    <div
      className={`${styles.form} ${props.className} ${
        props.disabled ? styles.disabled : ""
      }`}
    >
      {props.children}
    </div>
  );
}

function FormRow(props: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div className={`${styles.formRow} ${props.className}`}>
      {props.children}
    </div>
  );
}

function FormControlGroup(props: { children: ReactNode }): ReactNode {
  return <div className={styles.controlGroup}>{props.children}</div>;
}

function FormSelect(props: { children: ReactNode }): ReactNode {
  return <div className={styles.formSelect}>{props.children}</div>;
}

function FormControl(props: { children: ReactNode }): ReactNode {
  return <div className={styles.formControl}>{props.children}</div>;
}

function FormLabel(props: {
  children: ReactNode;
  optional?: boolean;
  className?: string;
}): ReactNode {
  return (
    <label className={`${styles.formLabel} ${props.className}`}>
      {props.children} {props.optional === true ? "" : "*"}
    </label>
  );
}

function FormSection(props: {
  children: ReactNode;
  title?: string;
  description?: string;
}): ReactNode {
  return (
    <div className={styles.formSection}>
      {props.title && (
        <h2 className={styles.formSectionHeader}>{props.title}</h2>
      )}
      {props.description && (
        <p className={styles.formSectionDescription}>{props.description}</p>
      )}
      {props.children}
    </div>
  );
}

function GetNumericTextEntryValue(e: ChangeEvent<HTMLInputElement>): number {
  if (e.target.value) {
    const asNumber = parseFloat(e.target.value);
    if (isNaN(asNumber)) {
      return 0;
    }

    return asNumber;
  } else {
    return 0;
  }
}

export {
  Form,
  FormRow,
  FormControlGroup,
  FormSelect,
  FormLabel,
  FormControl,
  GetNumericTextEntryValue,
  FormSection,
};
