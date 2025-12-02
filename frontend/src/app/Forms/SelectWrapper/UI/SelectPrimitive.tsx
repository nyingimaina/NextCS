import { PureComponent } from "react";
import SelectWrapper from "./SelectWrapper";

type WrapperType = { value: string };

interface IProps {
  items: string[];
  selectedResolver: (candidate: string) => boolean;
  onChange: (items: string[]) => void;
  menuPortalTarget?: HTMLElement;
  isMulti?: boolean;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  onCreateNew?: (value: string) => void | Promise<void>;
  disabled?: boolean;
  onSearch?: (value: string) => void | Promise<void>;
}

export default class SelectPrimitive extends PureComponent<IProps> {
  private get options(): WrapperType[] {
    return this.props.items.map((item) => ({
      value: item,
    }));
  }

  render() {
    return (
      <SelectWrapper<WrapperType>
        {...this.props}
        data={this.options}
        valueResolver={(item) => item.value}
        labelResolver={(item) => item.value}
        selectedResolver={(candidate) =>
          this.props.selectedResolver(candidate.value)
        }
        onChange={(items) =>
          this.props.onChange(items.map((item) => item.value))
        }
      />
    );
  }
}
