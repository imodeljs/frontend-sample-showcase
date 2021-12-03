/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ViewStateProps } from "@itwin/core-common";
import { EntityState, IModelConnection, Viewport, ViewState } from "@itwin/core-frontend";
import "common/samples-common.scss";

export default class SerializeViewApi {

  public static serializeCurrentViewState(viewport: Viewport): ViewStateProps {
    /** Create a deep copy of the view and save its properties */
    const clonedView = viewport.view.clone();

    /** returns a serialized ViewState as a set of properties */
    return clonedView.toProps();
  }

  public static async deserializeViewState(imodel: IModelConnection, props: ViewStateProps): Promise<ViewState | undefined> {
    /** Grab the type of imodel to reconstruct the view */
    const ctor = await imodel.findClassFor<typeof EntityState>(props.viewDefinitionProps.classFullName, undefined) as typeof ViewState | undefined;

    if (undefined !== ctor) {
      /** Recreate the saved view from the properties json object */
      return ctor.createFromProps(props, imodel);
    }
    return undefined;
  }

  public static async loadViewState(viewport: Viewport, props: ViewStateProps) {
    const view = await this.deserializeViewState(viewport.iModel, props);
    if (undefined !== view) {
      /** Load the saved view */
      viewport.changeView(view, { animateFrustumChange: true });
    }
  }
}
