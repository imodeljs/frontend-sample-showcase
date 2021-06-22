/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";

export interface Label {
  value: string;
  component: React.ReactNode;
}

export interface DrawerProps {
  labels: Label[];
  open?: boolean;
  onDrawerOpen: () => void;
  onDrawerClosed: () => void;
}

export interface DrawState {
  active?: string;
}

export const Drawer: React.FunctionComponent<DrawerProps> = ({ labels, open, onDrawerClosed, onDrawerOpen, children }) => {
  const [active, setActive] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!open) {
      setActive(undefined);
    } else {
      setActive((prev) => {
        if (!prev) {
          return labels[0]?.value;
        }
        return prev;
      });
    }
  }, [open, labels]);

  const onItemClick = React.useCallback((value: string) => {
    setActive((prev) => {
      if (prev === value) {
        onDrawerClosed();
        return undefined;
      }
      onDrawerOpen();
      return value;
    });
  }, [onDrawerClosed, onDrawerOpen]);

  const activeIndex = labels.findIndex((label) => label.value === active);

  return (
    <div className="sample-editor-pane">
      <div id="sample-editor-pane-nav">
        {labels.map((label, index) => (
          <DrawerItem key={index} value={label.value} active={label.value === active} onClick={onItemClick}>
            {label.component}
          </DrawerItem>
        ))}
      </div>
      {React.Children.toArray(children).map((child, index) =>
        <div key={index} id="sample-editor-pane-drawer" style={activeIndex !== index ? { display: "none" } : undefined}>
          {child}
        </div>
      )
      }
    </div >
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

  const classes = ["sample-editor-pane-nav-item"];
  if (active) {
    classes.push("active");
  }

  return (
    <div className={classes.join(" ")} title={value} onClick={onItemClick}>
      {children}
    </div>
  );
};
