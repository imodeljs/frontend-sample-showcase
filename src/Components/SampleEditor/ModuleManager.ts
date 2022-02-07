/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { InternalModule } from "@bentley/monaco-editor";
import { isAbsolute } from "path";

export interface Module {
  dependency: string;
  version: string;
  lib: string;
  global: string;
  types?: string;
}

export class ModuleManager {
  public static root: string = new URL(window.location.pathname, window.location.origin).href;
  public static defaultModuleVersion: string;
  public static preferredModuleVersion: string;
  private static moduleRegistry: Record<string, Module[]> = {};

  public static generateManifest() {
    const manifest = [];
    for (const key in ModuleManager.moduleRegistry) {
      if (Object.prototype.hasOwnProperty.call(ModuleManager.moduleRegistry, key)) {
        manifest.push(...ModuleManager.moduleRegistry[key]);
      }
    }
    return manifest;
  }

  public static get registry() {
    return ModuleManager.moduleRegistry;
  }

  public static formatModule(name: string, version: string, options: { lib: string, global: string, types?: string }) {
    return new InternalModule(name, version, {
      libUrl: ModuleManager.root && !isAbsolute(options.lib) ? new URL(options.lib, ModuleManager.root).href : options.lib,
      global: options.global,
      typesUrl: options.types ? ModuleManager.root && !isAbsolute(options.types) ? new URL(options.types, ModuleManager.root).href : options.types : undefined,
    });
  }
}
