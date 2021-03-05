/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from "react";

/** given a range of min-max, if val is outside that range,
 * clamp it to the nearest boundary
 */
export function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(val, min));
}

const toolManagerDomEvents = [
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseover",
  "mouseout",
  "wheel",
  "touchstart",
  "touchend",
  "touchcancel",
  "touchmove",
];

/** the ToolManager typically handles dom events from the viewport. As part of that,
 * it prevents the default behavior of all events. That breaks most default HTML functionality
 * such as links, inputs, etc mouse interactions. This wrapper component stops the propagation
 * of the events so the tool manager won't prevent the default behavior.
 * Also as a convenience, by default marker HTML has pointer-events set to 'none', since this
 * wrapper is for markers with interactive HTML, it sets the pointer-events to 'auto'.
 *
 * In React < 17, in HTML markers, using the react event listeners props (i.e. onMouseDown) to stopPropagation
 * does not work. Using the underlying event.nativeEvent might, but attaching your own dom listeners is equivalent.
 * In React 17 native handlers should work because React changed its event emulation strategy.
 */
export function HtmlMarkerWrapper({
  children,
  ...props
}: React.HTMLProps<HTMLDivElement>) {
  const elemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const current = elemRef.current;
    if (current) {
      const stopPropagation = (e: Event) => e.stopPropagation();
      toolManagerDomEvents.forEach((eventName) =>
        current.addEventListener(eventName, stopPropagation)
      );
      return () =>
        toolManagerDomEvents.forEach((eventName) =>
          current.removeEventListener(eventName, stopPropagation)
        );
    }
    return undefined;
  }, [elemRef]);

  return (
    <div {...props} ref={elemRef} style={{ pointerEvents: "auto" }}>
      {children}
    </div>
  );
}
