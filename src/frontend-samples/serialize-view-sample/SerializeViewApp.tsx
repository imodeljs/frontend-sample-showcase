/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ViewStateProps } from "@bentley/imodeljs-common";
import { EntityState, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { SavedView } from "@bentley/ui-framework";
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

    /** Grabs all important information from the view */
    const viewStateProperties = clonedView.toProps();

    return viewStateProperties;
  }

  public static async loadViewState(viewport: Viewport, props: ViewStateProps) {
    /** Recreate the saved view from the properties json object */
    const ctor = await viewport.iModel.findClassFor<typeof EntityState>(props.viewDefinitionProps.classFullName, undefined) as typeof ViewState | undefined;
    if (undefined === ctor)
      throw new Error("Class not found");

    const view = ctor.createFromProps(props, viewport.iModel);
    if (undefined === view)
      throw new Error("Failed to construct ViewState");

    /** Load the saved view */
    if (undefined !== view) {
      viewport.changeView(view, { animateFrustumChange: true });
    }
  }
}
