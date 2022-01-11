/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./DrawerHandle.scss";

export interface DrawerLabel {
  value: string;
  label: React.ReactNode;
}

export interface DrawerHandleProps {
  items: DrawerLabel[];
  active?: string;
  setActive: (value?: string) => void;
}
export const DrawerHandle: React.FunctionComponent<DrawerHandleProps> = ({ items, active, setActive }) => {

  const onItemClick = React.useCallback((value: string) => {
    if (value === active) {
      setActive(undefined);
    } else {
      setActive(value);
    }
  }, [active, setActive]);

  return (
    <div id="drawer-nav">
      {items.map((item, index) => (
        <DrawerItem key={index} value={item.value} active={item.value === active} onClick={onItemClick}>
          {item.label}
        </DrawerItem>
      ))}
    </div>
  );
};

interface DrawerItemProps {
  active?: boolean;
  value: string;
  onClick: (value: string) => void;
}

const DrawerItem: React.FunctionComponent<DrawerItemProps> = ({ active, value, onClick, children }) => {

  const onItemClick = React.useCallback(() => {
    onClick(value);
  }, [onClick, value]);

  const classes = ["drawer-nav-item"];
  if (active) {
    classes.push("active");
  }

  return (
    <div className={classes.join(" ")} title={value} onClick={onItemClick}>
      {children}
    </div>
  );
};
