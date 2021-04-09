/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorDef } from "@bentley/imodeljs-common";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";
import { ClearEmphasizeAction, ClearHideAction, ClearIsolateAction, ClearOverrideAction, EmphasizeAction, HideAction, IsolateAction, OverrideAction } from "./EmphasizeElementsApi";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { EmphasizeElements, IModelApp } from "@bentley/imodeljs-frontend";

enum ActionType {
  Emphasize = "Emphasize",
  Isolate = "Isolate",
  Hide = "Hide",
  Override = "Color",
}

export const EmphasizeElementsWidget: React.FunctionComponent = () => {
  const [selectionIsEmptyState, setSelectionIsEmptyState] = React.useState<boolean>(true);
  const [emphasizeIsActiveState, setEmphasizeIsActiveState] = React.useState<boolean>(false);
  const [hideIsActiveState, setHideIsActiveState] = React.useState<boolean>(false);
  const [isolateIsActiveState, setIsolateIsActiveState] = React.useState<boolean>(false);
  const [overrideIsActiveState, setOverrideIsActiveState] = React.useState<boolean>(false);

  const [wantEmphasisState, setWantEmphasisState] = React.useState<boolean>(true);
  const [colorValueState, setColorValueState] = React.useState<ColorDef>(ColorDef.red);

  useEffect(() => {
    Presentation.selection.selectionChange.addListener(_onSelectionChanged);

    /** This function is called when the widget is destroyed, similar to ComponentWillUnmount */
    return () => {
      const vp = IModelApp.viewManager.selectedView;

      if (undefined === vp)
        return;

      const emph = EmphasizeElements.getOrCreate(vp);
      emph.clearEmphasizedElements(vp);
      emph.clearHiddenElements(vp);
      emph.clearIsolatedElements(vp);
      emph.clearOverriddenElements(vp);
    };
  }, []);

  const _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    setSelectionIsEmptyState(selection.isEmpty);
  };

  const _onColorPick = (colorValue: ColorDef) => {
    setColorValueState(colorValue);
  };

  const _handleActionButton = (type: ActionType) => {
    switch (type) {
      default:
      case ActionType.Emphasize: {
        if (new EmphasizeAction(wantEmphasisState).run())
          setEmphasizeIsActiveState(true);
        break;
      }
      case ActionType.Isolate: {
        if (new IsolateAction().run())
          setIsolateIsActiveState(true);
        break;
      }
      case ActionType.Hide: {
        if (new HideAction().run())
          setHideIsActiveState(true);
        break;
      }
      case ActionType.Override: {
        if (new OverrideAction(colorValueState).run())
          setOverrideIsActiveState(true);
        break;
      }
    }
  };

  const _handleClearButton = (type: ActionType) => {
    switch (type) {
      default:
      case ActionType.Emphasize: {
        if (new ClearEmphasizeAction().run())
          setEmphasizeIsActiveState(false);
        break;
      }
      case ActionType.Isolate: {
        if (new ClearIsolateAction().run())
          setIsolateIsActiveState(false);
        break;
      }
      case ActionType.Hide: {
        if (new ClearHideAction().run())
          setHideIsActiveState(false);
        break;
      }
      case ActionType.Override: {
        if (new ClearOverrideAction().run())
          setOverrideIsActiveState(false);
        break;
      }
    }
  };

  const _onToggleEmphasis = (wantEmphasis: boolean) => {
    setWantEmphasisState(wantEmphasis);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options">
        <div className="sample-options-4col">
          <span>Emphasize</span>
          <Toggle isOn={wantEmphasisState} showCheckmark={true} onChange={_onToggleEmphasis} disabled={selectionIsEmptyState} />
          <Button buttonType={ButtonType.Primary} onClick={() => _handleActionButton(ActionType.Emphasize)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => _handleClearButton(ActionType.Emphasize)} disabled={!emphasizeIsActiveState}>Clear</Button>
          <span>Hide</span>
          <span />
          <Button buttonType={ButtonType.Primary} onClick={() => _handleActionButton(ActionType.Hide)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => _handleClearButton(ActionType.Hide)} disabled={!hideIsActiveState}>Clear</Button>
          <span>Isolate</span>
          <span />
          <Button buttonType={ButtonType.Primary} onClick={() => _handleActionButton(ActionType.Isolate)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => _handleClearButton(ActionType.Isolate)} disabled={!isolateIsActiveState}>Clear</Button>
          <span>Override</span>
          <ColorPickerButton initialColor={colorValueState} onColorPick={_onColorPick} disabled={selectionIsEmptyState} />
          <Button buttonType={ButtonType.Primary} onClick={() => _handleActionButton(ActionType.Override)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => _handleClearButton(ActionType.Override)} disabled={!overrideIsActiveState}>Clear</Button>
        </div>
      </div>
    </>
  );
};

export class EmphasizeElementsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "EmphasizeElementsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "EmphasizeElementsWidget",
          label: "Emphasize Elements Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <EmphasizeElementsWidget />,
        }
      );
    }
    return widgets;
  }

}
