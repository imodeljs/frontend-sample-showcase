/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from "react";
import {
  BeButtonEvent,
  EventHandled,
  IModelApp,
  PrimitiveTool,
  Viewport,
} from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";
import { I18NNamespace } from "@bentley/imodeljs-i18n";

/* this creates objects that throw errors on access, perfect for objects that
 * should be considered a runtime error to use, such as default context state for
 * react contexts that require a valid provider */
function createUnusableObject<T extends {}>(usageErrorMessage: string): T {
  return new Proxy({} as T, {
    get() {
      throw Error("Tried to use unusable object: " + usageErrorMessage);
    },
  });
}

export interface ToolsContextType {
  PlaceMarkerTool: typeof PrimitiveTool;
}

/** the default value of our ToolsContext is invalid, it will show this string
 * as an error to remind programmers that they need to make sure they included
 * a ToolsProvider as an ancestor in the component tree */
const defaultToolsContextValue = createUnusableObject<ToolsContextType>(
  "default context state is invalid, ensure you have a ToolsProvider as an ancestor"
);

export const ToolsContext = React.createContext(defaultToolsContextValue);

namespace ToolsProvider {
  export interface Props {
    i18nNamespace: I18NNamespace;
    addMarker: (p: Point3d) => void;
  }
}

class ToolsProvider extends React.Component<ToolsProvider.Props> {
  // this function-initialized property will create our tool class for us on creation
  // but we can use the ToolsProvider's this to access all React state and props
  PlaceMarkerTool = (() => {
    // need an alias to the ToolProvider instance `this` during construction of this property,
    // because the `this` keyword will refer to the PrimitiveTool instance in its methods
    const toolProviderThis = this;

    /** This class defines the user's interaction while placing a new marker. It is launched by a button in the UI.
     *  While it is active, the tool handles events from the user, notably mouse clicks in the viewport. */
    return class PlaceMarkerTool extends PrimitiveTool {
      public static toolId = "Test.DefineLocation"; // <== Used to find flyover (tool name), description, and keyin from namespace tool registered with...see CoreTools.json for example...
      public static iconSpec = "icon-star"; // <== Tool button should use whatever icon you have here...

      public isCompatibleViewport(
        vp: Viewport | undefined,
        isSelectedViewChange: boolean
      ): boolean {
        return (
          super.isCompatibleViewport(vp, isSelectedViewChange) &&
          undefined !== vp &&
          vp.view.isSpatialView()
        );
      }

      public isValidLocation = () => true; // Allow snapping to terrain, etc. outside project extents.

      public requireWriteableTarget = () => false; // Tool doesn't modify the imodel.

      public onPostInstall() {
        super.onPostInstall();
        this.setupAndPromptForNextAction();
      }

      public onRestartTool(): void {
        this.exitTool();
      }

      protected setupAndPromptForNextAction(): void {
        // Accusnap adjusts the effective cursor location to 'snap' to geometry in the view
        IModelApp.accuSnap.enableSnap(true);
      }

      // A reset button is the secondary action button, ex. right mouse button.
      public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
        this.onReinitialize(); // Calls onRestartTool to exit
        return EventHandled.No;
      }

      // A data button is the primary action button, ex. left mouse button.
      public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
        if (undefined === ev.viewport) return EventHandled.No; // Shouldn't really happen

        // ev.point is the current world coordinate point adjusted for snap and locks
        toolProviderThis.props.addMarker(ev.point);

        this.onReinitialize(); // Calls onRestartTool to exit
        return EventHandled.No;
      }
    };
  })();

  public componentDidMount() {
    // when this "ToolContext" component mounts, register the react-connected tool
    this.PlaceMarkerTool.register(this.props.i18nNamespace);
  }

  public componentWillUnmount() {
    // when this "ToolContext" component unmounts, unregister the react-connected tool
    IModelApp.tools.unRegister(this.PlaceMarkerTool.toolId);
  }

  public render() {
    // when rendering, provide a react context with a reference to the internal tools through this
    return (
      <ToolsContext.Provider value={this}>
        {this.props.children}
      </ToolsContext.Provider>
    );
  }
}

export default ToolsProvider;
