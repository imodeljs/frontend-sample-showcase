/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { DisplayError } from "./ErrorDisplay";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ hasError: true, error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <DisplayError error={this.state.error} errorInfo={this.state.errorInfo} />
      );
    }
    return this.props.children;
  }
}
