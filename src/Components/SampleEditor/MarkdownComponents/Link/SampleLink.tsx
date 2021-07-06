/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback } from "react";
import { AnchorProps } from "./Link";

export interface SampleLinkProps extends AnchorProps {
  onClick: (group: string | null, sample: string | null, file?: { name: string, start: number, end: number }) => Promise<void>;
}

export const SampleLink: FunctionComponent<SampleLinkProps> = ({ href, children, onClick }) => {
  const onHrefClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (href) {
      const normalized = href.replace("/?", "");
      const urlSearchParams = new URLSearchParams(normalized);
      const group = urlSearchParams.get("group");
      const sample = urlSearchParams.get("sample");
      const file = urlSearchParams.get("file");
      const start = urlSearchParams.get("start");
      const end = urlSearchParams.get("end");
      const fileSelection = file && start && end ? { name: file, start: parseInt(start, 10), end: parseInt(end, 10) } : undefined;
      onClick(group, sample, fileSelection);
    }
  }, [href, onClick]);

  return (<a onClick={onHrefClick}>{children}</a>);

};
