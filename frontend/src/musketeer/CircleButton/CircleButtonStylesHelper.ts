import circleButtonStyles from "./Styles/CircleButton.module.css";

export type CircleButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark";

export default class CircleButtonStylesHelper {
  static getCircleButtonStyle(args?: {
    className?: string;
    variant?: CircleButtonVariant;
  }): string {
    const { className = "", variant = "primary" } = args ?? {};

    const buttonClass = `
      ${className}
      ${circleButtonStyles.button}
      ${circleButtonStyles.outline}
      ${circleButtonStyles.round}
      ${circleButtonStyles.animated}
      ${circleButtonStyles.bounceOnClick}
      ${circleButtonStyles[variant]}
    `;

    return buttonClass.trim().replace(/\s+/g, " ");
  }
}
