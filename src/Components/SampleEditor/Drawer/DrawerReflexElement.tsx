/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { Dispatch, forwardRef, SetStateAction, useCallback, useEffect, useState } from "react";
import { ReflexElement, ReflexElementProps, ReflexHandle } from "react-reflex";
import { DrawerComponent, DrawerContainer } from "./DrawerContainer";
import { DrawerHandle, DrawerLabel } from "./DrawerHandle";
import "./DrawerReflexElement.scss";

export type DrawerItem = DrawerLabel & DrawerComponent;

export interface DrawerReflexElementProps extends ReflexElementProps {
  open: boolean;
  items: DrawerItem[];
  onOpenDrawer: Dispatch<SetStateAction<boolean>>;
}

export const DrawerReflexElement = forwardRef<ReflexElement, DrawerReflexElementProps>(({ items, open, onOpenDrawer, ...props }, ref) => {
  (props as any).innerRef = ref;
  const [active, setActive] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      setActive(undefined);
    } else {
      setActive((prev) => {
        if (!prev) {
          return items[0]?.value;
        }
        return prev;
      });
    }
  }, [open, items]);

  const setActiveItem = useCallback((value?: string) => {
    onOpenDrawer(value !== undefined);
    setActive(value);
  }, [onOpenDrawer]);

  return (
    <ReflexElement {...props} className="drawer">
      <ReflexHandle className="drawer-handle">
        <DrawerHandle items={items} active={active} setActive={setActiveItem} />
      </ReflexHandle>
      <DrawerContainer items={items} active={active} />
    </ReflexElement>
  );
});

DrawerReflexElement.displayName = "DrawerReflexElement";
