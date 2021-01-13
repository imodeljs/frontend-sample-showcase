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

    // console.log(`selected class is: ${e.target.value}`);
    const classElements: any = props.classElementsMap.get(e.target.value);
    const elementNames: any = [];
    const elementNameIdMap = new Map();
    for (const element of classElements) {
      elementNames.push(element.cOMPONENT_NAME);
      elementNameIdMap.set(element.cOMPONENT_NAME, element.id);
    }
    // console.log(elementNames);
    setElements(elementNames);
    // console.log(`element id is ${elementNameIdMap.get("EX-201")}`);
    IotAlertApp.setElementNameIdMap(elementNameIdMap);
  };

  const _onElementChange = (e: any) => {
    // To do: Code for element selection.
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
