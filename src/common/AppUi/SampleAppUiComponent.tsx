/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";

import { ColorTheme, ConfigurableUiContent, DragDropLayerRenderer, FrameworkVersion, SafeAreaContext, StateManager, ThemeManager, ToolbarDragInteractionContext, UiFramework } from "@bentley/ui-framework";
import { SafeAreaInsets } from "@bentley/ui-ninezone";
import { Provider } from "react-redux";
import { BeDragDropContext } from "@bentley/ui-components";
import { AppUi } from "./AppUi";

export class SampleAppUiComponent extends React.Component {
  public static async initialize(iModelName: string, frontStageName: string) {
    AppUi.initialize();
    await AppUi.setFrontstage(iModelName, frontStageName);
  }

  /** Creates an App instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {};
    UiFramework.setColorTheme(ColorTheme.Dark);
  }
  public render(): JSX.Element {
    return (
      <Provider store={StateManager.store} >
        <ThemeManager>
          <BeDragDropContext>
            <SafeAreaContext.Provider value={SafeAreaInsets.All}>
              <ToolbarDragInteractionContext.Provider value={true}>
                <FrameworkVersion version={"2"}>
                  <ConfigurableUiContent />
                </FrameworkVersion>
              </ToolbarDragInteractionContext.Provider>
            </SafeAreaContext.Provider>
            <DragDropLayerRenderer />
          </BeDragDropContext>
        </ThemeManager>
      </Provider >
    );
  }
}
