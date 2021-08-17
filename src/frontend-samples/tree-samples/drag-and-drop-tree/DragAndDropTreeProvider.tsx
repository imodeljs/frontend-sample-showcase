/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { DragAndDropTreeComponent } from "./DragAndDropTreeComponent";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const DragAndDropTreeProvider: React.FC = () => {

  // See documentation on DndProvider backends: https://react-dnd.github.io/react-dnd/docs/overview
  return (
    <DndProvider backend={HTML5Backend}>
      <DragAndDropTreeComponent />
    </DndProvider>
  );
};
