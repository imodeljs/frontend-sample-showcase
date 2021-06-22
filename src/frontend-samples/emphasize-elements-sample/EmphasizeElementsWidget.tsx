/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { ColorDef } from "@bentley/imodeljs-common";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";
import { EmphasizeElementsApi } from "./EmphasizeElementsApi";
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
  // START WIDGET_SETUP
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
  // END WIDGET_SETUP

  const _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    setSelectionIsEmptyState(selection.isEmpty);
  };

  const _onColorPick = (colorValue: ColorDef) => {
    setColorValueState(colorValue);
  };

  // START ON_CLICK_ACTION
  const _handleActionButton = (type: ActionType) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    switch (type) {
      default:
      case ActionType.Emphasize: {
        EmphasizeElementsApi.emphasizeSelectedElements(wantEmphasisState, vp);
        setEmphasizeIsActiveState(true);
        break;
      }
      case ActionType.Isolate: {
        EmphasizeElementsApi.isolateSelectedElements(vp);
        setIsolateIsActiveState(true);
        break;
      }
      case ActionType.Hide: {
        EmphasizeElementsApi.hideSelectedElements(vp);
        setHideIsActiveState(true);
        break;
      }
      case ActionType.Override: {
        EmphasizeElementsApi.overrideSelectedElements(colorValueState, vp);
        setOverrideIsActiveState(true);
        break;
      }
    }
  };
  // END ON_CLICK_ACTION

  // START ON_CLICK_CLEAR
  const _handleClearButton = (type: ActionType) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    switch (type) {
      default:
      case ActionType.Emphasize: {
        EmphasizeElementsApi.clearEmphasizedElements(vp);
        setEmphasizeIsActiveState(false);
        break;
      }
      case ActionType.Isolate: {
        EmphasizeElementsApi.clearIsolatedElements(vp);
        setIsolateIsActiveState(false);
        break;
      }
      case ActionType.Hide: {
        EmphasizeElementsApi.clearHiddenElements(vp);
        setHideIsActiveState(false);
        break;
      }
      case ActionType.Override: {
        EmphasizeElementsApi.clearOverriddenElements(vp);
        setOverrideIsActiveState(false);
        break;
      }
    }
  };
  // END ON_CLICK_CLEAR

  const _onToggleEmphasis = (wantEmphasis: boolean) => {
    setWantEmphasisState(wantEmphasis);
  };

  return (
    // START CONTROLS
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
    // END CONTROLS
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
