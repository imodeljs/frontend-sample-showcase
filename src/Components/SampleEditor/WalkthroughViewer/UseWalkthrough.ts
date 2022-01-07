/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2020 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
import { Annotation, AnnotationContribution, DoublyLinkedList, DoublyLinkedNode, IAnnotation, MarkdownProps, normalizeFilePath, useAnnotationService } from "@bentley/monaco-editor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink } from "../MarkdownComponents/Link/ExternalLink";
import { createLinkOverride } from "../MarkdownComponents/Link/Link";
import { SampleLink } from "../MarkdownComponents/Link/SampleLink";
import { WalkthroughLink } from "../MarkdownComponents/Link/WalkthroughLink";

export interface Walkthrough {
  annotationsHandler: AnnotationContribution;
  steps: DoublyLinkedList<Annotation>;
  overrideStep: string | undefined;
  markdownOptions: Omit<MarkdownProps, "children">;
}

export const useWalkthrough = (walkthrough: Annotation[] | undefined, onSampleClicked: (groupName: string | null, sampleName: string | null, wantScroll: boolean) => Promise<void>): Walkthrough | undefined => {
  const [walkthroughOverride, setWalkthroughOverride] = useState<string | undefined>();
  const [annotationsHandler, steps] = useAnnotationService({ steps: walkthrough });

  const onAnnotationClick = useCallback((anno: IAnnotation) => {
    const findStep = (step: DoublyLinkedNode<Annotation>) => Boolean(step.value.startLineNumber === anno.lineNumber && step.value.startLineNumber === anno.endLineNumber && step.value.file && normalizeFilePath(anno.uri.toString(false)) === normalizeFilePath(step.value.file));
    const annotation = steps.find(findStep);
    if (annotation && annotation.value.id) {
      setWalkthroughOverride(annotation.value.id);
    }
  }, [steps]);

  useEffect(() => {
    if (annotationsHandler) {
      const disposable = annotationsHandler.onAnnotationClick(onAnnotationClick);
      return disposable.dispose;
    }
    return;
  }, [annotationsHandler, onAnnotationClick]);

  useEffect(() => {
    setWalkthroughOverride(undefined);
  }, [walkthroughOverride]);

  const markdownOptions: Omit<MarkdownProps, "children"> = useMemo(() => ({
    options: {
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
                      .then(() => setWalkthroughOverride(step))
                      .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(error);
                      });
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
                    onSampleClicked(group, sample, true)
                      .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(error);
                      });
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
    },
  }), [onSampleClicked]);

  return useMemo(() => {
    if (annotationsHandler && steps.length) {
      return { steps, overrideStep: walkthroughOverride, annotationsHandler, markdownOptions };
    }
    return undefined;
  }, [annotationsHandler, walkthroughOverride, markdownOptions, steps]);
};
