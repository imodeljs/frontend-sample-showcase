/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { Viewport } from "@bentley/imodeljs-frontend";
import { SavedView } from "@bentley/ui-framework";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import SerializeViewUI from "./SerializeViewUI";

export default class SerializeViewApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <SerializeViewUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static serializeCurrentViewState(viewport: Viewport): string {
    /** Create a deep copy of the view and save its properties */
    const savedViewProps = SavedView.viewStateToProps(viewport.view.clone())

    /** Convert the SavedViewProps object to JSON */
    return JSON.stringify(savedViewProps);
  }

  public static async loadViewState(viewport: Viewport, savedViewPropsAsJson: string) {
    /** Convert the json back into an Object */
    const savedViewProps = JSON.parse(savedViewPropsAsJson);

    /** Recreate the ViewState object */
    const viewstateloaded = await SavedView.viewStateFromProps(viewport.iModel, savedViewProps);
    if (viewstateloaded !== undefined) {
      viewport.changeView(viewstateloaded, { animateFrustumChange: true });
    }
  }
}
