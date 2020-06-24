/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";

import { ColorTheme, ConfigurableUiContent, DragDropLayerRenderer, FrameworkVersion, SafeAreaContext, StateManager, ThemeManager, ToolbarDragInteractionContext } from "@bentley/ui-framework";
import { SafeAreaInsets } from "@bentley/ui-ninezone";
import { Provider } from "react-redux";
import { BeDragDropContext } from "@bentley/ui-components";
import { AppUi } from "./AppUi";

export class SampleAppUiComponent extends React.Component {
  private static _initialized: boolean = false;

  public static async initialize(frontStageName: string) {
    if (!this._initialized) {
      this._initialized = true;
      AppUi.initialize();
    }
    await AppUi.setFrontstage(frontStageName);
  }

  /** Creates an App instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {};
  }
  public render(): JSX.Element {
    return (
      <Provider store={StateManager.store} >
        <ThemeManager theme={ColorTheme.Dark}>
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
