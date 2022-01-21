/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./Divider.scss";

export interface DividerComponentState {
  left: number;
}

export interface DividerComponentProps {
  bounds: DOMRect;
  menuChildren?: React.ReactNode;
  leftChildren?: React.ReactNode;
  rightChildren?: React.ReactNode;
  onDragged?: (leftPanelWidth: number, rightPanelWidth: number) => void;
  buffer?: number;
  sideL?: number;
  sideR?: number;
}

export class DividerHandleComponent extends React.Component<{}, {}> {
  public render() {
    return <div className={"grab-handle"} id={"grabber-div"}></div>;
  }
}

export class DividerComponent extends React.Component<DividerComponentProps, {}> {
  public state: DividerComponentState;

  private _oldPosition: number = 0;
  private _elem?: HTMLElement;
  private _container: HTMLElement | null = null;

  private get _buffer(): number {
    return undefined === this.props.buffer ? 0 : this.props.buffer;
  }
  private get _width(): number {
    let width: number = 0;
    if (null === this._container)
      return width;
    const widthStr = window.getComputedStyle(this._container)?.getPropertyValue("width");
    if (undefined !== widthStr && widthStr)
      width = parseInt(widthStr, 10);
    return width;
  }
  private limitToBounds(n: number): number {
    n = Math.min(n, this.props.bounds.right - (this._elem!.clientWidth + this._buffer));
    n = Math.max(n, this.props.bounds.left + this._buffer);
    return n;
  }

  constructor(props: DividerComponentProps) {
    super(props);

    let left: number;
    if (undefined !== props.sideL)
      left = props.sideL + props.bounds.left;
    else if (undefined !== props.sideR)
      left = props.bounds.right - props.sideR;
    else
      left = props.bounds.left + props.bounds.width / 2;

    left = Math.min(left, this.props.bounds.right - this._buffer);
    left = Math.max(left, this.props.bounds.left + this._buffer);

    this.state = { left };
  }

  public componentDidUpdate(prevProps: DividerComponentProps, prevState: DividerComponentState) {
    const currentBounds = this.props.bounds;
    if (currentBounds.height !== prevProps.bounds.height
      || currentBounds.width !== prevProps.bounds.width) {
      const left = ((this.state.left - prevProps.bounds.left) / prevProps.bounds.width) * this.props.bounds.width + this.props.bounds.left;
      this.setState({ left });
    }

    if (this.state.left !== prevState.left)
      this.onDraggedCallback();
  }

  private _mouseDownDraggable = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    document.addEventListener("mousemove", this._mouseMoveDraggable);
    document.addEventListener("mouseup", this._mouseUpDraggable);
    this._oldPosition = e.clientX;
    this._elem = e.currentTarget;
  };

  private _mouseMoveDraggable = (e: MouseEvent) => {
    e = e || window.event;
    e.preventDefault();
    if (undefined === this._elem) return;

    const newPosition = this.limitToBounds(this._elem.offsetLeft - (this._oldPosition - e.clientX));
    this._oldPosition = this.limitToBounds(e.clientX);

    this.setState({ left: newPosition });
  };

  private onDraggedCallback(): void {
    const left = this.state.left - this.props.bounds.left;
    const right = this.props.bounds.width - left - this._width;
    if (undefined !== this.props.onDragged)
      this.props.onDragged(left, right);
  }

  private _mouseUpDraggable = (_e: MouseEvent) => {
    document.removeEventListener("mousemove", this._mouseMoveDraggable);
    document.removeEventListener("mouseup", this._mouseUpDraggable);
  };

  // There must be a better way to set panels on either side of the divider.
  public render() {
    return (
      <>
        <div id={"divider-panel-left"} className={"divider-panel"}
          style={{
            top: this.props.bounds.top,
            height: this.props.bounds.height,
            left: this.props.bounds.left,
            width: this.state.left,
          }}
        >
          {this.props.leftChildren}
        </div>
        <div className={"dividing-line"}
          ref={(element) => this._container = element}
          style={{
            left: this.state.left,
            top: this.props.bounds.top,
            height: this.props.bounds.height,
          }}
          id={"divider-div"}
          onMouseDown={this._mouseDownDraggable}
        >
          {this.props.menuChildren ? this.props.menuChildren : <DividerHandleComponent />}
        </div>
        <div id={"divider-panel-right"} className={"divider-panel"}
          style={{
            top: this.props.bounds.top,
            height: this.props.bounds.height,
            left: this.state.left,
            width: this.props.bounds.right - this.state.left,
          }}
        >
          {this.props.rightChildren}
        </div>
      </>
    );
  }
}
