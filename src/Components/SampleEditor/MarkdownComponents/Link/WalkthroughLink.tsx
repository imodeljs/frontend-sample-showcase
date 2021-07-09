/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback } from "react";
import { AnchorProps } from "./Link";

export interface WalkthroughLinkProps extends AnchorProps {
  onClick: (step: string, group: string | null, sample: string | null) => void;
}

export const WalkthroughLink: FunctionComponent<WalkthroughLinkProps> = ({ href, children, onClick }) => {
  const onHrefClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (href) {
      const normalized = href.replace("/?", "");
      const urlSearchParams = new URLSearchParams(normalized);
      const step = urlSearchParams.get("step");

      if (step) {
        const group = urlSearchParams.get("group");
        const sample = urlSearchParams.get("sample");
        onClick(step, group, sample);
      }
    }
  }, [href, onClick]);

  return (<a onClick={onHrefClick}>{children}</a>);

};
