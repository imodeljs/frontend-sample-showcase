import { Button, ButtonType, Select } from "@bentley/ui-core";
import IotAlertApp from "./IotAlertApp";
import * as React from "react";
import { MessageBox } from "./MessageBox";

import "./IotAlert.scss";

interface ElementSelectorProps {
  classList: string[];
  classElementsMap: Map<string, []>;
  isAlertOn: boolean;
  disabled: boolean;
}

export function ElementSelector(props: ElementSelectorProps) {
  const [elements, setElements] = React.useState(["EX-201", "EX-202", "EX-203", "EX-204", "EX-205"]);
  const [tags, setTags] = React.useState(["EX-201"]);

  const _onClassChange = (e: any) => {
    // The elements list would be populated from respective class.
    const elementNames = IotAlertApp.fetchElementsFromClass(e.target.value, props.classElementsMap);
    setElements(elementNames);
    setTags(IotAlertApp.getTags());
  };

  const _onElementChange = (e: any) => {
    const selectedElement = e.target.value;
    IotAlertApp.setSelectedElements(selectedElement);
    setTags(IotAlertApp.getTags());
  };

  const removeTag = (i: any) => {
    const newTags = [...tags];
    newTags.splice(i, 1);
    setTags(newTags);
    IotAlertApp.setTags(newTags);
  };

  return (
    <>
      <div className="sample-options-2col">
        <span>Select class</span>
        <Select
          options={props.classList}
          onChange={_onClassChange}
          disabled={props.disabled}
        />
        <span>Select element</span>
        <Select
          options={elements}
          onChange={_onElementChange}
          disabled={props.disabled}
        />
        <span>Alert</span>
        <div className="sample-options-2col-1">
          <Button buttonType={ButtonType.Primary} disabled={props.disabled && props.isAlertOn}>Trigger</Button>
          <Button buttonType={ButtonType.Primary} disabled={props.disabled && !props.isAlertOn}>Clear</Button>
        </div>
        {(tags !== undefined && tags.length) ? <span>Observed elements </span> : ""}
        {props.isAlertOn ?
          <div className="input-tag">
            <div >
              <ul className="input-tag__tags">
                {tags !== undefined ? tags.map((tag, i) => (
                  <li key={tag}>
                    {tag}
                    <button type="button" onClick={() => { removeTag(i); }}>+</button>
                  </li>
                )) : ""}
              </ul>
            </div>
          </div>
          : ""}
        {
          props.isAlertOn && tags !== undefined ? tags.map((tag) => (
            <MessageBox onButtonClick={async () => IotAlertApp.zoomToElements(tag)} isOpen={props.isAlertOn} message={`Alert coming from element ${tag}.`} id={tag} key={tag} />
          )) : ""
        }
      </div>
    </>
  );
}
