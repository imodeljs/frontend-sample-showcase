/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import ExplodeApi, { ExplodeObject, ExplodeProvider } from "./ExplodeApi";
import { Animator, IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Button, Select, Slider, ToggleSwitch } from "@itwin/itwinui-react";
import "./Explode.scss";

/** List of objects that can be exploded.  The 'elementIds' will be populate during start up. */
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
      for (const vp of IModelApp.viewManager) {
        ExplodeApi.clearIsolate(vp);
        ExplodeProvider.getOrCreate(vp).drop();
      }
      ExplodeApi.cleanUpCallbacks.forEach((func) => func());
    };
  }, []);

  /** Populates the element ids of objects defined by category codes on iModel connect. */
  useEffect(() => {
    if (iModelConnection) {
      populateObjects(iModelConnection).then(() => {
        setIsPopulatingObjects(false);
      })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }, [iModelConnection]);

  // useEffect(() => { console.debug("hook2"); }, [explodeFactor]);

  /** Causes the exploded view */
  useEffect(() => {
    if (viewport) {
      // The API has a 'current' state because this animate function cannot be tied to a useState variable or it will become stale.
      // The simplest solution was to introduce a static variable in the API but this could be kept in an object instead.
      ExplodeApi.explodeAttributes.current = explodeFactor;
      ExplodeApi.refSetData(viewport, object.name, object.elementIds, explodeFactor);
    }
  }, [explodeFactor, object, viewport]);
  //
  useEffect(() => {
    if (viewport) {
      if (isolate) {
        ExplodeApi.isolateElements(viewport, object.elementIds);
        ExplodeApi.zoomToObject(viewport, object.name);
      } else {
        ExplodeApi.clearIsolate(viewport);
      }
    }
  }, [object, isolate, viewport]);

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

        // Update the Explode Factor
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
  const onObjectChanged = (value: ExplodeObject) => {
    setObject(value);
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

  const objectEntries = _objects.map((o) => ({ value: o, label: o.name }));
  const animationText = isAnimated ? "Pause" : ((min + max) / 2 >= explodeFactor ? "Explode" : "Collapse");

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className={"sample-options-2col"}>
        <label>Animate</label>
        <Button size="small" styleType="cta" onClick={onAnimateButton}>{animationText}</Button>
        <label>Explode Scaling</label>
        <Slider min={min} max={max} values={[explodeFactor]} step={step} onChange={(values) => setExplodeFactor(values[0])} onUpdate={(values) => setExplodeFactor(values[0])} disabled={isAnimated} />
        <label>Object</label>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Select<ExplodeObject> value={object} options={objectEntries} onChange={onObjectChanged} style={{ width: "fit-content" }} disabled={isAnimated || isPopulatingObjects} onHide={() => { }} onShow={() => { }} />
          <Button styleType="high-visibility" onClick={onZoomButton} disabled={isAnimated}>Zoom To</Button>
        </span>
        <label>Isolate</label>
        <ToggleSwitch checked={isolate} onChange={(e) => setIsolate(e.target.checked)} disabled={isAnimated} />
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
        },
      );
    }
    return widgets;
  }
}
