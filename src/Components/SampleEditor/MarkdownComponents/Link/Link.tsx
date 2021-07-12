/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";

export interface LinkType<T extends AnchorProps> {
  filter: (href: string) => boolean;
  component: FunctionComponent<T>;
  props: T;
}

export interface LinkProps extends AnchorProps {
  linkTypes: LinkType<any>[];
}

export interface AnchorProps {
  href?: string;
}

export const Link: FunctionComponent<LinkProps> = ({ href, linkTypes, children }) => {

  if (href) {
    for (const linkType of linkTypes) {
      if (linkType.filter(href)) {
        return React.createElement(linkType.component, { href, ...linkType.props }, children);
      }
    }
  }

  return (<a href={href}>{children}</a>);
};

export const createLinkOverride = (props: LinkProps) => ({
  component: Link,
  props,
});
