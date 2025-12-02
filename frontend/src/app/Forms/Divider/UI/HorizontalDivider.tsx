import { PureComponent } from "react";

interface IProps {
  width?: string;
}
export default class HorizontalDivider extends PureComponent<IProps> {
  render() {
    return (
      <div
        style={{
          borderBottom: "dashed 1px #DFDFDF",
          marginTop: "5px",
          marginBottom: "5px",
          width: this.props.width,
        }}
      />
    );
  }
}
