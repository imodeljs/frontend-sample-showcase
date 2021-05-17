/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import ZoomToElementsApi, { ZoomOptions } from "./ZoomToElementsApi";
import { StandardViewId } from "@bentley/imodeljs-frontend";
import { Button, ButtonType, Input, Select, Toggle } from "@bentley/ui-core";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import "./ZoomToElements.scss";

const ZoomToElementsWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [listenerAdded, setListenerAdded] = React.useState<boolean>(false);
  const [elementsAreSelected, setElementsAreSelected] = React.useState<boolean>(false);
  const [elementList, setElementList] = React.useState<string[]>([]);
  const [selectedList, setSelectedList] = React.useState<string[]>([]);
  const [zoomOptions, setZoomOptions] = React.useState<ZoomOptions>({
    animateEnable: false,
    animateVal: true,
    marginEnable: false,
    marginVal: 0.1,
    relativeViewEnable: false,
    relativeViewVal: StandardViewId.Top,
    standardViewEnable: false,
    standardViewVal: StandardViewId.Top,
  });

  const _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    setElementsAreSelected(!selection.isEmpty);
  };

  useEffect(() => {
    // subscribe for unified selection changes
    if (!listenerAdded) {
      Presentation.selection.selectionChange.addListener(_onSelectionChanged);
      setListenerAdded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _handleCaptureIdsButton = () => {
    if (iModelConnection) {
      const toAdd: string[] = [];
      for (const element of iModelConnection.selectionSet.elements) {
        if (!elementList.includes(element)) {
          toAdd.push(element);
        }
      }
      setElementList([...elementList, ...toAdd]);
      iModelConnection.selectionSet.emptyAll();
    }
  };

  const _handleRemoveIdsButton = () => {
    if (iModelConnection) {
      const filteredList = elementList.filter((e) => selectedList.indexOf(e) < 0);
      setElementList(filteredList);
      setSelectedList([]);
      iModelConnection.selectionSet.emptyAll();
    }
  };

  const _handleSelectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (iModelConnection) {
      const selected: string[] = [];
      for (const option of event.target.selectedOptions) {
        selected.push(option.value);
      }
      setSelectedList(selected);
      iModelConnection.selectionSet.replace(selected);
    }
  };

  const _handleApplyZoom = async () => {
    if (iModelConnection) {
      await ZoomToElementsApi.zoomToElements(elementList, zoomOptions);

      // Select the elements.  This is not necessary, but it makes them easier to see.
      iModelConnection.selectionSet.replace(elementList);
    }
  };

  /** Selector for list of elementIds */
  const _elementIdSelector = () => {
    return (
      <Select
        multiple
        value={selectedList}
        onChange={_handleSelectorChange}
        options={Object.fromEntries(elementList.map((element) => [element, element]))}
      />
    );
  };

  return (
    <>
      <div className="sample-options">
        <div className="table-wrapper">
          {_elementIdSelector()}
          <div className="table-button-wrapper">
            <Button buttonType={ButtonType.Primary} title="Add Elements selected in view" onClick={() => _handleCaptureIdsButton()} disabled={!elementsAreSelected}>+</Button>
            <Button buttonType={ButtonType.Primary} title="Remove selected list entries" onClick={() => _handleRemoveIdsButton()} disabled={0 === selectedList.length}>-</Button>
          </div>
        </div>
        <span className="table-caption">{elementList.length} elementIds in list</span>
        <hr></hr>
        <div className="sample-options-3col">
          <Toggle isOn={zoomOptions.animateEnable} onChange={() => setZoomOptions({ ...zoomOptions, animateEnable: !zoomOptions.animateEnable })} />
          <span>Animate</span>
          <Toggle isOn={zoomOptions.animateVal} onChange={() => setZoomOptions({ ...zoomOptions, animateVal: !zoomOptions.animateVal })} disabled={!zoomOptions.animateEnable} />
          <Toggle isOn={zoomOptions.marginEnable} onChange={() => setZoomOptions({ ...zoomOptions, marginEnable: !zoomOptions.marginEnable })} />
          <span>Margin</span>
          <Input type="range" min="0" max="0.25" step="0.01" value={zoomOptions.marginVal} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setZoomOptions({ ...zoomOptions, marginVal: Number(event.target.value) })} disabled={!zoomOptions.marginEnable} />
          <Toggle isOn={zoomOptions.standardViewEnable} onChange={() => setZoomOptions({ ...zoomOptions, standardViewEnable: !zoomOptions.standardViewEnable })} />
          <span>Standard View</span>
          <ViewPicker onViewPick={(viewId: StandardViewId) => { setZoomOptions({ ...zoomOptions, standardViewVal: viewId }); }} disabled={!zoomOptions.standardViewEnable} />
          <Toggle isOn={zoomOptions.relativeViewEnable} onChange={() => setZoomOptions({ ...zoomOptions, relativeViewEnable: !zoomOptions.relativeViewEnable })} />
          <span>Relative View</span>
          <ViewPicker onViewPick={(viewId: StandardViewId) => { setZoomOptions({ ...zoomOptions, relativeViewVal: viewId }); }} disabled={!zoomOptions.relativeViewEnable} />
        </div>
        <hr></hr>
        <div style={{ textAlign: "center" }}>
          <Button buttonType={ButtonType.Primary} onClick={_handleApplyZoom} disabled={0 === elementList.length}>Zoom to Elements</Button>
        </div>
      </div>
    </>
  );
};

interface ViewPickerProps {
  /** function to run when user selects a view */
  onViewPick?: ((viewId: StandardViewId) => void) | undefined;
  disabled?: boolean;
}

class ViewPicker extends React.PureComponent<ViewPickerProps> {
  private viewIdFromStringVal(stringVal: string): StandardViewId {
    let viewId = StandardViewId.NotStandard;
    switch (stringVal) {
      case "0": viewId = StandardViewId.Top; break;
      case "1": viewId = StandardViewId.Bottom; break;
      case "2": viewId = StandardViewId.Left; break;
      case "3": viewId = StandardViewId.Right; break;
      case "4": viewId = StandardViewId.Front; break;
      case "5": viewId = StandardViewId.Back; break;
      case "6": viewId = StandardViewId.Iso; break;
      case "7": viewId = StandardViewId.RightIso; break;
    }
    return viewId;
  }

  private _handleViewPick = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.onViewPick)
      this.props.onViewPick(this.viewIdFromStringVal(event.target.value));
  };

  public render() {
    const options = {
      [StandardViewId.Top]: "Top",
      [StandardViewId.Bottom]: "Bottom",
      [StandardViewId.Left]: "Left",
      [StandardViewId.Right]: "Right",
      [StandardViewId.Front]: "Front",
      [StandardViewId.Back]: "Back",
      [StandardViewId.Iso]: "Iso",
      [StandardViewId.RightIso]: "RightIso",
    };
    return (
      <Select onChange={this._handleViewPick} disabled={this.props.disabled} options={options} />
    );
  }
}

export class ZoomToElementsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ZoomToElementsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ZoomToElementsWidget",
          label: "Zoom to Elements Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ZoomToElementsWidget />,
        }
      );
    }
    return widgets;
  }
}
