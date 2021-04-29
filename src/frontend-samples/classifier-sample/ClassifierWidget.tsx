import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { SpatialClassificationProps } from "@bentley/imodeljs-common";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { KeySet } from "@bentley/presentation-common";
import { Button, Input, Select } from "@bentley/ui-core";
import { IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { ISelectionProvider, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import ClassifierApi from "./ClassifierApi";
import { ClassifierProperties } from "./ClassifierProperties";
import "./Classifier.scss";

const ClassifierWidget: React.FunctionComponent = () => {
  const _insideDisplayEntries: { [key: string]: string } = {};
  _insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.ElementColor]] = "Element Color";
  _insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Off]] = "Off";
  _insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.On]] = "On";
  _insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed]] = "Dimmed";
  _insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Hilite]] = "Hilite";

  const _outsideDisplayEntries: { [key: string]: string } = {};
  _outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Off]] = "Off";
  _outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.On]] = "On";
  _outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed]] = "Dimmed";

  const iModelConnection = useActiveIModelConnection();
  const [classifiersState, setClassifiersState] = React.useState<{ [key: string]: string }>({});
  const [classifierState, setClassifierState] = React.useState<string>();
  const [expandDistState, setExpandDistState] = React.useState<number>(3);
  const [outsideDisplayKeyState, setOutsideDisplayKeyState] = React.useState<string>(SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed]);
  const [insideDisplayKeyState, setInsideDisplayKeyState] = React.useState<string>(SpatialClassificationProps.Display[SpatialClassificationProps.Display.ElementColor]);
  const [keysState, setKeysState] = React.useState<KeySet>(new KeySet());

  useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp)
      initWidget(iModelConnection!, vp);
    else
      IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => { initWidget(iModelConnection!, _vp); });

    return () => {
      ClassifierApi.removeSelectionListener();
    };
  }, []);

  /**
   * This callback will be executed by SandboxViewport once the iModel has been loaded.
   * The reality model will default to on.
   */
  const initWidget = async (iModelConn: IModelConnection, viewport: ScreenViewport) => {
    const classifiers = await ClassifierApi.getAvailableClassifierListForViewport(viewport);
    const commercialModelId = Object.keys(classifiers)[0];
    setClassifiersState(classifiers);
    setClassifierState(commercialModelId);

    ClassifierApi.addSelectionListener(_onSelectionChanged);
    await ClassifierApi.turnOnAvailableRealityModel(viewport, iModelConn);
    _handleApply();
  };

  // Handle Apply. Clear selection and update classifier.
  const _handleApply = () => {
    const vp = IModelApp.viewManager.selectedView;
    setKeysState(new KeySet());
    if (vp) {
      const classifier: SpatialClassificationProps.Classifier = getClassifierValues(classifierState!);
      ClassifierApi.updateRealityDataClassifiers(vp, classifier);
    }
  };

  /*
  * Get property values for the classifier.
  */
  const getClassifierValues = (modelId: string): SpatialClassificationProps.Classifier => {
    const flags = new SpatialClassificationProps.Flags();

    flags.inside = SpatialClassificationProps.Display[insideDisplayKeyState as keyof typeof SpatialClassificationProps.Display];
    flags.outside = SpatialClassificationProps.Display[outsideDisplayKeyState as keyof typeof SpatialClassificationProps.Display];
    flags.isVolumeClassifier = false;

    const classifier: SpatialClassificationProps.Classifier = {
      modelId,
      expand: expandDistState,
      name: `${modelId}`,
      flags,
    };
    return classifier;
  };

  const _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    setKeysState(keys);
  };

  // Some reasonable defaults depending on what classifier is chosen.
  const _onClassifierChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (classifiersState[event.target.value].includes("Buildings")) {
      setInsideDisplayKeyState("On");
      setExpandDistState(3.5);
    }
    if (classifiersState[event.target.value].includes("Streets")) {
      setInsideDisplayKeyState("Hilite");
      setExpandDistState(2);
    }
    if (classifiersState[event.target.value].includes("Commercial")) {
      setInsideDisplayKeyState("ElementColor");
      setExpandDistState(1);
    }
    if (classifiersState[event.target.value].includes("Street Poles")) {
      setInsideDisplayKeyState("Hilite");
      setExpandDistState(1);
    }

    setClassifierState(event.target.value);
    setOutsideDisplayKeyState("Dimmed");
  };

  const _onMarginChange = (event: any) => {
    try {
      const expandDist = parseFloat(event.target.value);
      setExpandDistState(expandDist);
    } catch { }
  };

  const _onOutsideDisplayChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setOutsideDisplayKeyState(event.target.value);
  };

  const _onInsideDisplayChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setInsideDisplayKeyState(event.target.value);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <span>Select classifier:</span>
        <Select className="classification-dialog-select" options={classifiersState} onChange={_onClassifierChange} />
        <span>Margin:</span>
        <Input type="number" min="0" max="100" value={expandDistState} onChange={_onMarginChange} />
        <span>Outside Display:</span>
        <Select options={_outsideDisplayEntries} value={outsideDisplayKeyState} onChange={_onOutsideDisplayChange} />
        <span>Inside Display:</span>
        <Select options={_insideDisplayEntries} value={insideDisplayKeyState} onChange={_onInsideDisplayChange} />
        <Button onClick={_handleApply}> Apply </Button>
        <span></span>
        <ClassifierProperties keys={keysState} imodel={useActiveIModelConnection()} />
      </div>
    </div>
  );
};

export class ClassifierWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClassifierWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ClassifierWidget",
          label: "Classifier Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ClassifierWidget />,
        }
      );
    }
    return widgets;
  }
}
