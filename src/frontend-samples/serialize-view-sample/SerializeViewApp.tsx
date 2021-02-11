/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ViewStateProps } from "@bentley/imodeljs-common";
import { EntityState, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import SerializeViewUI from "./SerializeViewUI";

export default class SerializeViewApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <SerializeViewUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static serializeCurrentViewState(viewport: Viewport): ViewStateProps {
    /** Create a deep copy of the view and save its properties */
    const clonedView = viewport.view.clone();

    console.log(JSON.stringify(clonedView.toProps()))

    /** return a serialized ViewState as a set of properties */
    return clonedView.toProps();
  }

  public static async deserializeViewState(viewport: Viewport, props: ViewStateProps): Promise<ViewState | undefined> {
    /** Grab the type of imodel to reconstruct the view */
    const ctor = await viewport.iModel.findClassFor<typeof EntityState>(props.viewDefinitionProps.classFullName, undefined) as typeof ViewState | undefined;

    if (undefined !== ctor) {
      /** Recreate the saved view from the properties json object */
      return ctor.createFromProps(props, viewport.iModel);
    }
    return undefined
  }

  public static async loadViewState(viewport: Viewport, props: ViewStateProps) {
    const view = await this.deserializeViewState(viewport, props);
    if (undefined !== view) {
      /** Load the saved view */
      viewport.changeView(view, { animateFrustumChange: true });
    }
  }
}
