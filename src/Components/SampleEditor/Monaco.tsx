/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import MonacoEditor, { useModuleState } from "@bentley/monaco-editor";
import modules from "./Modules";

const MonacoMemo = () => {
  const moduleActions = useModuleState()[1];

  React.useEffect(() => {
    moduleActions.setModules(modules);
  }, [moduleActions]);

  return <MonacoEditor></MonacoEditor>;
};

export default React.memo(MonacoMemo, () => true);
