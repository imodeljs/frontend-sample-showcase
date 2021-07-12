/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent } from "react";
import { AnchorProps } from "./Link";

export const ExternalLink: FunctionComponent<AnchorProps> = ({ href, children }) => {
  return (<a href={href} target="_blank" rel="noopener noreferrer">{children}</a>);
};
