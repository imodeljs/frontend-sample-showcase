/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ViewStateProps } from "@bentley/imodeljs-common";
import { EntityState, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";

export default class SerializeViewApp {

  public static serializeCurrentViewState(viewport: Viewport): ViewStateProps {
    /** Create a deep copy of the view and save its properties */
    const clonedView = viewport.view.clone();

    /** returns a serialized ViewState as a set of properties */
    return clonedView.toProps();
  }

  public static async deserializeViewState(viewport: Viewport, props: ViewStateProps): Promise<ViewState | undefined> {
    /** Grab the type of imodel to reconstruct the view */
    const ctor = await viewport.iModel.findClassFor<typeof EntityState>(props.viewDefinitionProps.classFullName, undefined) as typeof ViewState | undefined;

    if (undefined !== ctor) {
      /** Recreate the saved view from the properties json object */
      return ctor.createFromProps(props, viewport.iModel);
    }
    return undefined;
  }

  public static async loadViewState(viewport: Viewport, props: ViewStateProps) {
    const view = await this.deserializeViewState(viewport, props);
    if (undefined !== view) {
      /** Load the saved view */
      viewport.changeView(view, { animateFrustumChange: true });
    }
  }
}
