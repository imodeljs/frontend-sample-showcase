/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorDef } from "@bentley/imodeljs-common";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";

enum ActionType {
  Emphasize = "Emphasize",
  Isolate = "Isolate",
  Hide = "Hide",
  Override = "Color",
}

export interface EmphasizeElementsProps {
  selectionIsEmpty: boolean;
  emphasizeIsActive: boolean;
  hideIsActive: boolean;
  isolateIsActive: boolean;
  overrideIsActive: boolean;
  wantEmphasis: boolean;
  colorValue: ColorDef;
  onColorPick: (colorValue: ColorDef) => void;
  handleActionButton: (type: ActionType) => void;
  handleClearButton: (type: ActionType) => void;
}

export const EmphasizeElementsWidget: React.FunctionComponent<EmphasizeElementsProps> = (emphasizeElementsProps) => {
  const [wantEmphasisState, setWantEmphasisState] = React.useState<boolean>(emphasizeElementsProps.wantEmphasis);
  const [colorValueState, setColorValueState] = React.useState<ColorDef>(emphasizeElementsProps.colorValue);

  useEffect(() => {

  }, []);

  const _onToggleEmphasis = (wantEmphasis: boolean) => {
    setWantEmphasisState(wantEmphasis);
  };

  const _onColorPick = (colorValue: ColorDef) => {
    setColorValueState(colorValue);
    emphasizeElementsProps.onColorPick(colorValue);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-4col">
        <span>Emphasize</span>
        <Toggle isOn={wantEmphasisState} showCheckmark={true} onChange={_onToggleEmphasis} disabled={emphasizeElementsProps.selectionIsEmpty} />
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleActionButton(ActionType.Emphasize)} disabled={emphasizeElementsProps.selectionIsEmpty}>Apply</Button>
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleClearButton(ActionType.Emphasize)} disabled={!emphasizeElementsProps.emphasizeIsActive}>Clear</Button>
        <span>Hide</span>
        <span />
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleActionButton(ActionType.Hide)} disabled={emphasizeElementsProps.selectionIsEmpty}>Apply</Button>
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleClearButton(ActionType.Hide)} disabled={!emphasizeElementsProps.hideIsActive}>Clear</Button>
        <span>Isolate</span>
        <span />
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleActionButton(ActionType.Isolate)} disabled={emphasizeElementsProps.selectionIsEmpty}>Apply</Button>
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleClearButton(ActionType.Isolate)} disabled={!emphasizeElementsProps.isolateIsActive}>Clear</Button>
        <span>Override</span>
        <ColorPickerButton initialColor={colorValueState} onColorPick={_onColorPick} disabled={emphasizeElementsProps.selectionIsEmpty} />
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleActionButton(ActionType.Override)} disabled={emphasizeElementsProps.selectionIsEmpty}>Apply</Button>
        <Button buttonType={ButtonType.Primary} onClick={() => emphasizeElementsProps.handleClearButton(ActionType.Override)} disabled={!emphasizeElementsProps.overrideIsActive}>Clear</Button>
      </div>
    </>
  );
};
