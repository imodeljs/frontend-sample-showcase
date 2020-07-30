/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "chai";
import * as TypeMoq from "typemoq";

import { Guid, GuidString } from "@bentley/bentleyjs-core";
import { Point3d, Range3d, Vector3d } from "@bentley/geometry-core";
import { Cartographic } from "@bentley/imodeljs-common";
import { BlankConnection, IModelConnection, ScreenViewport, SpatialViewState } from "@bentley/imodeljs-frontend";

function createViewDiv() {
  const div = document.createElement("div");
  assert(null !== div);
  div!.style.width = div!.style.height = "1000px";
  document.body.appendChild(div!);
  return div;
}

export class TestUtilities {
  public imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();
  public viewDiv = createViewDiv();

  public static getBlankConnection(): BlankConnection {
    const exton = Cartographic.fromDegrees(-75.686694, 40.065757, 0);
    const contextId: GuidString = Guid.createValue();
    const blankConnection: BlankConnection = BlankConnection.create({
      name: "test",
      location: exton,
      extents: new Range3d(-1000, -1000, -100, 1000, 1000, 100),
      contextId,
    });
    return blankConnection;
  }

  public static getScreenViewport(): ScreenViewport {
    const origin = new Point3d();
    const extents = new Vector3d(1, 1, 1);
    const blankConnection = this.getBlankConnection();
    const spatial = SpatialViewState.createBlank(blankConnection, origin, extents);
    const viewDiv = createViewDiv();
    return ScreenViewport.create(viewDiv, spatial);
  }

  public static getMockViewport() {
    const viewDiv = createViewDiv();
    const blankConnection = this.getBlankConnection();
    const origin = new Point3d();
    const extents = new Vector3d(1, 1, 1);
    const spatial = SpatialViewState.createBlank(blankConnection, origin, extents);
    ScreenViewport.create(viewDiv, spatial);
  }
}
