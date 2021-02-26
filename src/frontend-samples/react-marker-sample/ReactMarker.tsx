/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from "react";
import { Point3d } from "@bentley/geometry-core";
import { Marker } from "@bentley/imodel-react-hooks";

declare namespace ReactMarker {
  export interface Props {
    worldLocation: Point3d;
  }
}

// eslint-disable-next-line no-redeclare
function ReactMarker(props: ReactMarker.Props) {
  const [counter, setCounter] = React.useState(0);

  return (
    // to use the Marker component we need an IModelJsViewProvider as an ancestor
    <Marker
      worldLocation={props.worldLocation}
      // pass arbitrary jsx without setting up your own htmlElement
      jsxElement={
        <span style={{ backgroundColor: "#fff", borderRadius: 5 }}>
          <button onClick={() => setCounter((prev) => prev + 1)}>+</button>
          <span>{counter}</span>
          <button onClick={() => setCounter((prev) => prev - 1)}>-</button>
        </span>
      }
    />
  );
}

export default ReactMarker;
