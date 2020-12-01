/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { PropertyCategory, PropertyGrid } from "@bentley/ui-components";
import { DEFAULT_PROPERTY_GRID_RULESET, PresentationPropertyDataProvider } from "@bentley/presentation-components";
import { KeySet } from "@bentley/presentation-common";
import { IModelConnection } from "@bentley/imodeljs-frontend";

interface ClassifierPropertiesState {
  dataProvider?: PresentationPropertyDataProvider;
}

export interface PropertyProps {
  keys: KeySet;
  imodel?: IModelConnection;
}

export class ClassifierProperties extends React.Component<PropertyProps, ClassifierPropertiesState> {
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

    const dataProvider = new ClassifierProperties._classifierPropertyProvider({ imodel: this.props.imodel, ruleset: DEFAULT_PROPERTY_GRID_RULESET });
    dataProvider.keys = this.props.keys;
    this.setState({ dataProvider });
  }

  public componentDidMount() {
    this.createDataProvider();
  }

  public componentDidUpdate(prevProps: PropertyProps) {
    if (prevProps.keys === this.props.keys)
      return;

    this.createDataProvider();
  }

  /*
  This provider hides the source file information and expands all categories by default.
  */
  private static _classifierPropertyProvider = class extends PresentationPropertyDataProvider {
    public async getData() {
      const data = await super.getData();
      data.categories = data.categories.filter((obj) => {
        return obj.name !== "/selected-item/-source_file_information";
      });
      const newCategories = data.categories.map((value: PropertyCategory) => {
        return { ...value, expand: true };
      });
      data.categories = newCategories;
      return data;
    }
  };

  public render() {
    const dataProvider = this.state.dataProvider;
    return (
      <>
        <div className={"table-box"}>
          {dataProvider && <PropertyGrid dataProvider={dataProvider} />}
          {!dataProvider && <span>Select an element to see its properties.</span>}
        </div>
      </>
    );
  }
}
