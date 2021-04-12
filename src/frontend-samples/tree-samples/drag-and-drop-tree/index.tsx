/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { DragAndDropTree } from "./DragAndDropTree";
import { ControlPane } from "common/ControlPane/ControlPane";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@bentley/ui-core";
import { SampleDataProvider } from "common/DataProvider/SampleDataProvider";

/** Entry point of this sample */
export default class DragAndDropSample extends React.Component {
  public render(): React.ReactNode {
    return <App />;
  }
}

const App: React.FC = () => {
  const [treeDataProvider, setTreeDataProvider] = React.useState(new SampleDataProvider());

  // Resets downstream state by changing to a new instance of SampleDataProvider
  const handleReset = () => { setTreeDataProvider(new SampleDataProvider()); };

  // See documentation on DndProvider backends: https://react-dnd.github.io/react-dnd/docs/overview
  return (
    <>
      <ControlPane
        instructions="Rearrange tree structure by drag and dropping nodes."
        controls={<Button onClick={handleReset}>Reset</Button>}
      />
      <div className="sample-tree">
        <DndProvider backend={HTML5Backend}>
          <DragAndDropTree dataProvider={treeDataProvider} />
        </DndProvider>
      </div>
    </>
  );
};
