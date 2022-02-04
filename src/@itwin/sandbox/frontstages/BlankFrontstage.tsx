/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { ComponentType } from "react";
import { ConfigurableCreateInfo, ContentGroup, ContentGroupProps, CoreTools, Frontstage, FrontstageProps, FrontstageProvider, useActiveIModelConnection, ViewportContentControl } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";

export type IModelConnectionComponent = ComponentType<{ imodel: IModelConnection }>;

const IModelConnectionWrapper: React.FunctionComponent<{ components: IModelConnectionComponent[] }> = ({ components }) => {
  const iModelConnection = useActiveIModelConnection();

  return <>
    {iModelConnection && components.map((Child, index) => <Child key={index} imodel={iModelConnection} />)}
  </>;
};

interface BlankContentOptions {
  components: IModelConnectionComponent[];
}

class BlankContent extends ViewportContentControl {
  constructor(info: ConfigurableCreateInfo, options: BlankContentOptions) {
    super(info, options);

    if (options.components) {
      this.reactNode = (
        <IModelConnectionWrapper components={options.components} />
      );
    }
  }
}

export class BlankFrontstage extends FrontstageProvider {
  public id = "BlankFrontstage";
  // constants
  public static MAIN_CONTENT_ID = "BlankFrontstage";
  public static DEFAULT_NAVIGATION_WIDGET_KEY = "DefaultNavigationWidget";
  public static DEFAULT_MANIPULATION_WIDGET_KEY = "DefaultNavigationWidget";

  // Content group for all layouts
  private _contentGroup: ContentGroup;

  constructor(...components: IModelConnectionComponent[]) {
    super();

    const sampleViewportGroupProps: ContentGroupProps = {
      id: "BlankFrontstageContentGroup",
      layout: {
        id: "BlankFrontstageContentLayout",
      },
      contents: [
        {
          classId: BlankContent,
          id: "BlankFrontstageContents",
          applicationData: {
            components,
          },
        },
      ],
    };
    this._contentGroup = new ContentGroup(sampleViewportGroupProps);

  }

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps> {
    return (
      <Frontstage
        id={BlankFrontstage.MAIN_CONTENT_ID}
        defaultTool={CoreTools.selectElementCommand}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
      />
    );
  }
}
