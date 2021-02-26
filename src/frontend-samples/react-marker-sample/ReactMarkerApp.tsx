/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import ReactMarkerUI from "./ReactMarkerUI";
import SampleApp from "common/SampleApp";

const i18nNamespaceKey = "react-marker-i18n-namespace" as string;

export default class ReactMarkerApp implements SampleApp {
  public static _sampleNamespace: I18NNamespace;

  public static setup = async (
    iModelName: string,
    iModelSelector: React.ReactNode
  ): Promise<React.ReactNode> => {
    ReactMarkerApp._sampleNamespace = IModelApp.i18n.registerNamespace(
      i18nNamespaceKey
    );

    return (
      <ReactMarkerUI iModelName={iModelName} iModelSelector={iModelSelector} />
    );
  };

  public static teardown = async () => {
    IModelApp.i18n.unregisterNamespace(i18nNamespaceKey);
  };
}
