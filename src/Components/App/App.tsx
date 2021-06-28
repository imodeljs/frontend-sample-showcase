/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent } from "react";
import { SampleShowcase } from "Components/SampleShowcase/SampleShowcase";
import SearchIndex from "Components/Search/SearchIndex";

export const App: FunctionComponent = () => {

  if (new URLSearchParams(window.location.search).has("getSearchIndex")) {
    return (
      <SearchIndex />
    );
  }

  return (
    <SampleShowcase />
  );
};
