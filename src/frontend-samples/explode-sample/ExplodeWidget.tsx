import React, { useEffect } from "react";
import { useActiveIModelConnection, useActiveViewport } from "@bentley/ui-framework";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Button, Select, Slider, Toggle } from "@bentley/ui-core";
import ExplodeApi, { ExplodeObject, ExplodeProvider } from "./ExplodeApi";
import { Animator, IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import "./Explode.scss";

const _objects: ExplodeObject[] = [
  {
    name: "Exterior",
    elementIds: [],
    categories: ["Brick Exterior", "Dry Wall 1st", "Dry Wall 2nd", "Roof", "Wall 1st", "Wall 2nd"],
  },
  {
    name: "Windows",
    elementIds: [],
    categories: ["WINDOWS 2ND", "WINDOWS 1ST"],
  },
  {
    name: "Sunroom",
    elementIds: ["0x8ee", "0x22b", "0x960", "0x8ea", "0xf6a", "0x961", "0x22a", "0x22e", "0x95f", "0x22c", "0x8ed", "0x8ec", "0x8e4", "0x8e8", "0x22d", "0x95e", "0x95d", "0x962", "0x225", "0x963", "0x965", "0x8e5", "0xf46", "0x8e6", "0x967", "0x227", "0x228", "0x964", "0x8e7", "0x966", "0x8e2", "0x8ef", "0x184", "0x185", "0xf82", "0x1eb", "0x8e3", "0x229", "0x224", "0x226", "0x210", "0x8eb", "0x8e9", "0xf47"],
  },
];

const ExplodeWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const viewport = useActiveViewport();
  const [object, setObject] = React.useState<ExplodeObject>(_objects.find((o) => o.name === "Sunroom")!);
  const [explodeFactor, setExplodeFactor] = React.useState<number>((ExplodeApi.explodeAttributes.min + ExplodeApi.explodeAttributes.max) / 2);
  const [isolate, setIsolate] = React.useState<boolean>(true);
  const [isAnimated, setIsAnimated] = React.useState<boolean>(false);
  const [isPopulatingObjects, setIsPopulatingObjects] = React.useState<boolean>(true);

  useEffect(() => {
    ExplodeApi.cleanUpCallbacks = [];

    return () => {
      IModelApp.viewManager.forEachViewport((vp) => {
        ExplodeApi.clearIsolate(vp);
        ExplodeProvider.getOrCreate(vp).drop();
      });
      ExplodeApi.cleanUpCallbacks.forEach((func) => func());
    };
  }, []);

  useEffect(() => {
    if (iModelConnection) {
      populateObjects(iModelConnection).then(() => {
        setIsPopulatingObjects(false);
      });
    }
  }, [iModelConnection]);

  useEffect(() => {
    if (viewport)
      ExplodeApi.refSetData(viewport, object.name, object.elementIds, explodeFactor);
  }, [explodeFactor, object.elementIds, object.name, viewport]);

  useEffect(() => {
    if (viewport) {
      ExplodeApi.clearIsolate(viewport);
      if (isolate) {
        ExplodeApi.isolateElements(viewport, object.elementIds);
        ExplodeApi.zoomToObject(viewport, object.name);
      }
    }
  }, [object.name, isolate, viewport, object.elementIds]);

  /** Populates the element ids of objects defined by category codes. */
  const populateObjects = async (iModel: IModelConnection): Promise<void> => {
    const populateObjectsArr: Array<Promise<void>> = [];
    _objects.forEach((obj, index) => {
      if (obj.categories === undefined)
        return;

      populateObjectsArr.push((async () => {
        const elementIds = await ExplodeApi.queryElementsInByCategories(iModel, obj.categories!);
        _objects[index].elementIds = elementIds;
      })());
    });
    await Promise.all(populateObjectsArr);
  };

  /** Creates and starts an animator in the viewport. */
  const createAnimator = (): Animator => {
    const explode = (ExplodeApi.explodeAttributes.min + ExplodeApi.explodeAttributes.max) / 2 >= ExplodeApi.explodeAttributes.current;
    const goal = explode ? ExplodeApi.explodeAttributes.max : ExplodeApi.explodeAttributes.min;
    const animationStep = (explode ? 1 : -1) * ExplodeApi.explodeAttributes.step;
    const animator: Animator = {
      // Will be called before rendering a frame as well as force the viewport to re-render every frame.
      animate: () => {
        // Test for finishing the animation.
        if (goal === ExplodeApi.explodeAttributes.current) {
          setIsAnimated(false);
          return true;
        }
        // Tests if the slider has become out of sync with the step size.
        let newFactor = ExplodeApi.explodeAttributes.current + animationStep;
        if (explode ? newFactor > goal : newFactor < goal)
          newFactor = goal;

        // Side effects of updating the state are disabled.
        ExplodeApi.explodeAttributes.current = newFactor;
        setExplodeFactor(newFactor);
        return false;
      },
      // Will be called if the animations is interrupt (e.g. the camera is moved)
      interrupt: () => {
        setIsAnimated(false);
      },
    };
    return animator;
  };

  /** Methods that support the UI control interactions. */
  const onObjectChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const objectChanged = _objects.find((o) => o.name === event.target.value);
    if (objectChanged)
      setObject(objectChanged);
  };

  const onZoomButton = () => {
    if (viewport)
      ExplodeApi.zoomToObject(viewport, object.name);
  };

  const onAnimateButton = () => {
    if (!viewport) return;
    // This is the "pause" feature of the button.
    if (isAnimated) {
      ExplodeApi.setAnimator(viewport);
      setIsAnimated(false);
      // Will a handle the "explode" or "collapse" cases.
    } else {
      const animator = createAnimator();
      ExplodeApi.setAnimator(viewport, animator);
      setIsAnimated(true);
    }
  };

  const max = ExplodeApi.explodeAttributes.max;
  const min = ExplodeApi.explodeAttributes.min;
  const step = ExplodeApi.explodeAttributes.step;

  const objectEntries = _objects.map((o) => o.name);
  const animationText = isAnimated ? "Pause" : ((min + max) / 2 >= explodeFactor ? "Explode" : "Collapse");

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className={"sample-options-2col"}>
        <label>Animate</label>
        <Button onClick={onAnimateButton}>{animationText}</Button>
        <label>Explode Scaling</label>
        <Slider min={min} max={max} values={[explodeFactor]} step={step} showMinMax={true} onUpdate={(values) => setExplodeFactor(values[0])} disabled={isAnimated} />
        <label>Object</label>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Select value={object.name} options={objectEntries} onChange={onObjectChanged} style={{ width: "fit-content" }} disabled={isAnimated || isPopulatingObjects} />
          <Button onClick={onZoomButton} disabled={isAnimated}>Zoom To</Button>
        </span>
        <label>Isolate</label>
        <Toggle isOn={isolate} onChange={(checked) => setIsolate(checked)} disabled={isAnimated} />
      </div>
    </div>
  );
};

export class ExplodeWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ExplodeWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ExplodeWidget",
          label: "Explode Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ExplodeWidget />,
        }
      );
    }
    return widgets;
  }
}
