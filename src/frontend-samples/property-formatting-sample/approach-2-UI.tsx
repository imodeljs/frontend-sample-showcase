/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import "common/samples-common.scss";
import { Table } from "@bentley/ui-components";
import { PropertyFormattingApp, PropertyProps } from "./PropertyFormattingApp";
import { PresentationTableDataProvider } from "@bentley/presentation-components";

interface Approach2State {
  dataProvider?: PresentationTableDataProvider;
}

/* This approach uses PresentationTableDataProvider to all the work of querying the backend and
   providing the content to the PropertyGrid component. */
export class Approach2UI extends React.Component<PropertyProps, Approach2State> {
  constructor(props?: any) {
    super(props);
    this.state = {
    };
  }

  private createDataProvider() {
    if (!this.props.imodel || this.props.keys.isEmpty) {
      this.setState({ dataProvider: undefined });
      return;
    }

    const dataProvider = PropertyFormattingApp.createTableDataProvider(this.props.keys, this.props.imodel);
    this.setState({ dataProvider });
  }

  public componentDidMount() {
    this.createDataProvider();
  }

  public componentDidUpdate(prevProps: PropertyProps, _prevState: Approach2State) {
    if (prevProps.keys === this.props.keys)
      return;

    this.createDataProvider();
  }

  public render() {
    const dataProvider = this.state.dataProvider;
    return (
      <>
        <div className={"table-box"}>
          {dataProvider && <Table dataProvider={dataProvider} />}
          {!dataProvider && <span>Select an element to see its properties.</span>}
        </div>
      </>
    );
  }
}
