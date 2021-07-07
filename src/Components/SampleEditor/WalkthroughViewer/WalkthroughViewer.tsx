/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useMemo } from "react";
import { Annotation, Annotations } from "@bentley/monaco-editor";
import { createLinkOverride } from "../MarkdownComponents/Link/Link";
import { WalkthroughLink } from "../MarkdownComponents/Link/WalkthroughLink";
import { ExternalLink } from "../MarkdownComponents/Link/ExternalLink";
import { SampleLink } from "../MarkdownComponents/Link/SampleLink";

export interface WalkthroughViewerProps {
  walkthrough: Annotation[];
  show: boolean;
  onOpenClick: () => void;
  onCloseClick: () => void;
  onSampleClicked: (groupName: string | null, sampleName: string | null, wantScroll: boolean) => Promise<void>;
}

export const WalkthroughViewer: React.FunctionComponent<WalkthroughViewerProps> = (props) => {
  const { walkthrough, show, onCloseClick, onOpenClick, onSampleClicked } = props;
  const [walkthroughOverride, setWalkthroughOverride] = React.useState<string | undefined>();

  React.useEffect(() => {
    setWalkthroughOverride(undefined);
  }, [walkthroughOverride]);

  const markdownOptions = useMemo(() => ({
    overrides: {
      a: createLinkOverride({
        linkTypes: [
          {
            filter: (href) => !/^[a-z]+:?/gi.test(href) && /step/gi.test(href),
            component: WalkthroughLink,
            props: {
              onClick: (step: string, group: string | null, sample: string | null) => {
                if (group || sample) {
                  onSampleClicked(group, sample, true)
                    .then(() => setWalkthroughOverride(step));
                } else {
                  setWalkthroughOverride(step);
                }
              },
            },
          },
          {
            filter: (href) => !/^[a-z]+:?/gi.test(href) && (/sample/gi.test(href) || /group/gi.test(href)),
            component: SampleLink,
            props: {
              onClick: (group: string | null, sample: string | null) => {
                if (group || sample) {
                  onSampleClicked(group, sample, true);
                }
              },
            },
          },
          {
            filter: (href) => /^[a-z]+:?/gi.test(href),
            component: ExternalLink,
            props: {},
          },
        ],
      }),
    },
  }), [onSampleClicked]);

  return (
    <Annotations steps={walkthrough} show={show} onOpenClick={onOpenClick} onCloseClick={onCloseClick} markdownOptions={{ options: markdownOptions }} override={walkthroughOverride} />
  );
};
