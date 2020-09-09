/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { Content, KeySet } from "@bentley/presentation-common";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { PresentationPropertyDataProvider } from "@bentley/presentation-components";
import { DEFAULT_PROPERTY_GRID_RULESET } from "@bentley/presentation-components/lib/presentation-components/propertygrid/DataProvider";
import { PropertyGrid } from "@bentley/ui-components";

export class UsePresentationDataProvider extends React.Component<{ imodel?: IModelConnection, content?: Content }, {}> {

  public render() {
    let dataProvider;
    if (this.props.imodel && this.props.content) {
      dataProvider = new PresentationPropertyDataProvider({ imodel: this.props.imodel, ruleset: DEFAULT_PROPERTY_GRID_RULESET });
      dataProvider.keys = new KeySet(this.props.content.contentSet[0].primaryKeys);
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
