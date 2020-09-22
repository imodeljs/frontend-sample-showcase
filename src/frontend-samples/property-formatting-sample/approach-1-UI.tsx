/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { PropertyGrid } from "@bentley/ui-components";
import { PropertyFormattingApp, PropertyProps } from "./PropertyFormattingApp";

export class Approach1UI extends React.Component<PropertyProps, {}> {

  public render() {
    let dataProvider;
    if (this.props.imodel && !this.props.keys.isEmpty) {
      dataProvider = PropertyFormattingApp.createPresentationDataProvider(this.props.keys, this.props.imodel);
    }

    return (
      <>
        <div className={"table-box"}>
          {dataProvider && <PropertyGrid dataProvider={dataProvider} />}
          {!dataProvider && <span>Select an element to see its properties.</span>}
        </div>
      </>
    )
  }
}
