/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ErrorIndicator } from "@bentley/monaco-editor";
import React from "react";
import { DrawerLabel } from "./DrawerHandle";

export const ProblemsLabel: DrawerLabel = {
  value: "Problems",
  label: <>
    <span>Problems</span>
    <ErrorIndicator />
  </>,
};

export const WalkthroughLabel: DrawerLabel = {
  value: "Walkthrough",
  label: <span>Walkthrough</span>,
};
