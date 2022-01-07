/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, ReactNode, useCallback, useState } from "react";
import { BundlerStatus, TabNavigation as TabNav, useBundler } from "@bentley/monaco-editor";
import "./TabNavigation.scss";
import { IconButton, ProgressRadial } from "@itwin/itwinui-react";
import { SvgInfoCircular, SvgPlay } from "@itwin/itwinui-icons-react";
import { createPortal } from "react-dom";

export interface TabNavigationProps {
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
  showReadme: boolean;
  onRunClick: () => void;
  onShowReadme: () => void;
}

export const TabNavigation: FunctionComponent<TabNavigationProps> = ({ showReadme, iframeRef, onRunClick, onShowReadme }) => {
  const bundler = useBundler();
  const [iframeContent, setIframeContent] = useState<ReactNode>(null);

  const setup = useCallback((blobUrl: string, globals: Record<string, string>) => {
    const reactDomGlobal = globals["react-dom"];
    const reactGlobal = globals.react;
    const sandboxGlobal = globals["@itwinjs-sandbox"];

    return [
      `const root = document.getElementById('sample-container');`,
      `${sandboxGlobal}.AuthorizationClient.initializeOidc()`,
      `   .then(() => {`,
      `       return import("${blobUrl}")`,
      `   })`,
      `   .then((app) => {`,
      `       if (!app.default) {`,
      `           throw Error("Transpiled app does not contain a 'default' export. Ensure that you have an entry file and that it exports a 'default' module using using 'export default'")`,
      `       }`,
      `       ${reactDomGlobal}.render(${reactGlobal}.createElement(app.default), root)`,
      `   });`,
    ].join("\n");
  }, []);

  const onLoading = useCallback((status: BundlerStatus, progress: number) => {
    if (status === BundlerStatus.COMPLETE) {
      setIframeContent(null);
    } else {
      setIframeContent(
        <div style={{ display: "flex", height: "100%", width: "100%", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <ProgressRadial size="large" value={progress}>{progress > 1 ? progress.toFixed(0) : undefined}</ProgressRadial>
          <h2>Building</h2>
        </div >,
      );
    }
  }, []);

  const onBuildClick = useCallback(() => {
    onRunClick();
    if (iframeRef.current) {
      bundler.bundle({
        iframe: iframeRef.current,
        indexHtmlSrc: `${(process.env as any).REACT_APP_COMPILER_URL}/index.html`,
        setup,
        onLoading,
      })
        .catch(() => { });
    }
  }, [bundler, iframeRef, onLoading, onRunClick, setup]);

  return (
    <>
      {iframeRef.current?.parentElement && iframeContent && createPortal(<div className="iui-body" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>{iframeContent}</div>, iframeRef.current.parentElement)}
      <TabNav showClose={false}>
        <IconButton id="readme" className="action-item" size="small" styleType={"borderless"} onClick={onShowReadme} isActive={showReadme}>
          <SvgInfoCircular />
        </IconButton>
        <IconButton id="build" className="action-item" size="small" styleType={"borderless"} onClick={onBuildClick}>
          <SvgPlay color="#34e32a" />
        </IconButton>
      </TabNav>
    </>
  );
};
