import { Select } from "@bentley/ui-core";
import IotAlertApp from "./IotAlertApp";
import * as React from "react";

interface ElementSelectorProps {
  classList: string[];
  classElementsMap: Map<string, []>;
}

export function ElementSelector(props: ElementSelectorProps) {
  const [elements, setElements] = React.useState(["EX-201", "EX-202", "EX-203", "EX-204", "EX-205"]);

  const _onClassChange = (e: any) => {
    // The elements list would be populated from respective class.
    const elementNames = IotAlertApp.fetchElementsFromClass(e.target.value, props.classElementsMap);
    setElements(elementNames);
  };

  const _onElementChange = (e: any) => {
    const selectedElement = e.target.value;
    IotAlertApp.setSelectedElement(selectedElement);
  };

  return (
    <>
      <div className="sample-options-2col">
        <span>Select class: </span>
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
