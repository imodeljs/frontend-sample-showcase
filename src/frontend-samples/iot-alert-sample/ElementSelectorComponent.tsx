import { Select } from "@bentley/ui-core";
import * as React from "react";

interface ElementSelectorProps {
  classList: string[];
};

export function ElementSelector(props: ElementSelectorProps) {

  const [elements, setElements] = React.useState(["element1", "element2", "element3"]);

  const _onClassChange = () => {
    // To do: The elements list would be populated from respective class.
  }

  const _onElementChange = () => {
    // To do: Code for element selection.
  }

  return (
    <>
      <div className="sample-options-2col">
        <span>Select element class: </span>
        <Select
          className="iotalert-class-select"
          options={props.classList}
          onChange={_onClassChange}
        />
      </div >
      <div className="sample-options-2col">
        <span>Select element: </span>
        <Select
          className="iotalert-element-select"
          options={elements}
          onChange={_onElementChange}
        />
      </div >
    </>
  );
}
