/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "../viewport-frontstage-sample/node_modules/@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../../Components/GithubLink";
import "../../common/samples-common.scss";
import { IModelConnection, IModelApp } from "@bentley/imodeljs-frontend";
import { ModelProps } from "@bentley/imodeljs-common";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "toolbar-button-sample",
    label: "Toolbar Button Sample",
    image: "viewer-only-2d-thumbnail.png",
    setup: async (iModelName: string) => {
      return <ToolbarButtonAppUI iModelName={iModelName} />;
    },
  });
}
// The Props and State for this sample component
interface ToolbarButtonAppProps {
  iModelName: string;
}

interface ToolbarButtonAppState {
  models?: ModelProps[];
}

/** A React component that renders the UI specific for this sample */
export class ToolbarButtonAppUI extends React.Component<ToolbarButtonAppProps, ToolbarButtonAppState> {
  /** The sample's render method */
    public render() {
        return (
            <>
                <div className="sample-ui">
                    <div>
                        <span>This sample adds a tool button to the toolbar </span>
                    </div>
                </div>
            </>
        );
    }
}
