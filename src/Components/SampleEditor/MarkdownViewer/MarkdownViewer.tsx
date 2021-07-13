
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Link } from "../MarkdownComponents/Link/OldLink";

export interface MarkdownViewerProps {
  readme: string;
  onFileClicked: (file?: string | undefined) => void;
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export default class MarkdownViewer extends React.Component<MarkdownViewerProps> {

  public render() {
    const options = {
      overrides: {
        a: { component: Link, props: { fileClicked: this.props.onFileClicked, sampleClicked: this.props.onSampleClicked } },
      },
    };

    return (
      <div className="sample-editor-readme">
        <Markdown options={options}>{this.props.readme}</Markdown>
      </div>
    );
  }
}
