/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./DrawerContainer.scss";

export interface DrawerComponent {
  value: string;
  component: React.ReactNode;
}

export interface DrawerContainerProps {
  items: DrawerComponent[];
  active?: string;
}

export const DrawerContainer: React.FunctionComponent<DrawerContainerProps> = ({ items, active }) => {
  const component = items.find((item) => item.value === active);

  return (
    <div className="drawer-content">
      {component?.component}
    </div>
  );
};
