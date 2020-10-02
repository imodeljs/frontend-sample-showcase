/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { Toggle } from "@bentley/ui-core";
import { PropertyGrid } from "@bentley/ui-components";
import { PropertyFormattingApp, PropertyProps } from "./PropertyFormattingApp";
import { PresentationPropertyDataProvider } from "@bentley/presentation-components";

interface Approach1State {
  enableCustomize: boolean;
  dataProvider?: PresentationPropertyDataProvider;
}

/* This approach uses PresentationPropertyDataProvider to all the work of querying the backend and
   providing the content to the PropertyGrid component. */
export class Approach1UI extends React.Component<PropertyProps, Approach1State> {
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      enableCustomize: false,
    };
  }

  private createDataProvider() {
    if (!this.props.imodel || this.props.keys.isEmpty) {
      this.setState({ dataProvider: undefined });
      return;
    }

    const dataProvider = PropertyFormattingApp.createPropertyDataProvider(this.props.keys, this.props.imodel, this.state.enableCustomize);
    this.setState({ dataProvider });
  }

  public componentDidMount() {
    this.createDataProvider();
  }

  public componentDidUpdate(prevProps: PropertyProps, prevState: Approach1State) {
    if (prevProps.keys === this.props.keys && prevState.enableCustomize === this.state.enableCustomize)
      return;

    this.createDataProvider();
  }

  public render() {
    const dataProvider = this.state.dataProvider;
    return (
      <>
        <div className="sample-options-2col">
          <span>Customize:</span>
          <Toggle isOn={this.state.enableCustomize} onChange={(checked) => this.setState({ enableCustomize: checked })} disabled={undefined === dataProvider} />
        </div>
        <div className={"table-box"}>
          {dataProvider && <PropertyGrid dataProvider={dataProvider} />}
          {!dataProvider && <span>Select an element to see its properties.</span>}
        </div>
      </>
    )
  }
}
