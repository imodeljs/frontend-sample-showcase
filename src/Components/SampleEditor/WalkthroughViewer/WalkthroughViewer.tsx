/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AnnotationsHandler } from "@bentley/monaco-editor";
import { Walkthrough } from "./UseWalkthrough";

export interface WalkthroughViewerProps {
  walkthrough: Walkthrough;
  onSampleClicked: (groupName: string | null, sampleName: string | null, wantScroll: boolean) => Promise<void>;
}

export const WalkthroughViewer: React.FunctionComponent<WalkthroughViewerProps> = ({ walkthrough }) => {

  return (
    <AnnotationsHandler annotationSteps={walkthrough.steps} annotationHandler={walkthrough.annotationsHandler} show={true} markdownOptions={walkthrough.markdownOptions} />
  );
};
