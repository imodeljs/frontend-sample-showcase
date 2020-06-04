/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2020 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/

import * as React from "react";
import "./SampleEditor.scss";
import { MonacoEditorFile, File, MonacoEditor, MonacoEditorProps, NavigationFile, TabNavigation, Module } from "@bentley/monaco-editor";
import ts, { ImportDeclaration, TextChangeRange } from "typescript";
import path from "path";
import "./icons/codicon.css";

export interface SampleEditorProps {
  /** Files to inject into the component, can be any type of file (External, Navigation, etc.) */
  files?: File[];
  /** The height to be passed to the editor component. */
  height?: string;
  /** The width to be passed to the editor component. */
  width?: string;
}

export interface SampleEditorState {
  files?: (MonacoEditorFile & NavigationFile)[];
  currentFile?: string;
}

interface SampleEditorReplacementProps {
  files?: (MonacoEditorFile & NavigationFile)[];
  currentFile?: string;
}

export interface InternalFile extends File {
  import: Promise<{ default: string; }>;
}

type Sub<T extends T1, T1 extends object> = Pick<T, SetComplement<keyof T, keyof T1>>;
type SetComplement<A, A1 extends A> = SetDifference<A, A1>;
type SetDifference<A, B> = A extends B ? never : A;

const modules = [
  { name: "react" },
  { name: "react-dom" },
  { name: "@bentley/bentleyjs-core" },
  { name: "@bentley/context-registry-client" },
  { name: "@bentley/frontend-authorization-client" },
  { name: "@bentley/geometry-core" },
  { name: "@bentley/icons-generic-webfont" },
  { name: "@bentley/imodelhub-client" },
  { name: "@bentley/imodeljs-common" },
  { name: "@bentley/imodeljs-frontend" },
  { name: "@bentley/imodeljs-i18n" },
  { name: "@bentley/imodeljs-quantity" },
  { name: "@bentley/itwin-client" },
  { name: "@bentley/orbitgt-core" },
  { name: "@bentley/presentation-common" },
  { name: "@bentley/presentation-components" },
  { name: "@bentley/presentation-frontend" },
  { name: "@bentley/product-settings-client" },
  { name: "@bentley/ui-abstract" },
  { name: "@bentley/ui-components" },
  { name: "@bentley/ui-core" },
  { name: "@bentley/webgl-compatibility" }
] as Module[]

export default class SampleEditor extends React.Component<Sub<MonacoEditorProps, SampleEditorReplacementProps> & SampleEditorProps, SampleEditorState> {

  constructor(props: any) {
    super(props);
    this.state = {
      files: undefined,
      currentFile: undefined,
    };
    this.onTabClick = this.onTabClick.bind(this);
  }

  public componentDidMount() {
    this.props.files && this.getData(this.props.files);
  }

  public componentDidUpdate(prevProps: SampleEditorProps) {
    if (prevProps.files !== this.props.files) {
      this.setState({ files: undefined, currentFile: undefined })
      this.props.files && this.getData(this.props.files);
    }
  }

  public getData(props: File[]) {
    this.getInternalData(props)
      .then((importedData) => this.modifyImports(importedData))
      .then((modifiedData) => this.setState({ files: modifiedData, currentFile: modifiedData[0].name }))
      // tslint:disable-next-line: no-console
      .catch((err) => console.error(err));
  }

  public async getInternalData(files: File[]): Promise<(MonacoEditorFile & NavigationFile)[]> {
    return Promise.all(files.map(async (file: File) => {
      if ((file as InternalFile).import) {
        const internalFile = file as InternalFile;
        return {
          name: internalFile.name,
          code: await this.importInternalData(internalFile.import),
        };
        // If the file has code, just return it as is.
      }
      else if ((file as MonacoEditorFile).code) {
        return file as MonacoEditorFile;
      } else {
        // Otherwise, it's an empty file.
        return {
          name: file.name,
          code: "",
        };
      }
    }));
  }

  private modifyImports(importedFiles: (MonacoEditorFile & NavigationFile)[]) {
    return Promise.all(importedFiles.map((file) => {
      const sourceFile = ts.createSourceFile(
        "",
        file.code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );

      const relativeImport = this.extractRelativeImport(sourceFile);
      if (relativeImport) {
        return {
          ...file,
          code: this.modifyRelativeImports(sourceFile, relativeImport).text
        }
      } else {
        return file;
      }
    }));
  }

  public modifyRelativeImports(source: ts.SourceFile, relativeImport: ImportDeclaration) {
    const importValue = relativeImport.moduleSpecifier.getText()
    const newImportValue = importValue[importValue.length - 1] + "./" + path.basename(importValue);

    const sourceText = source.text;
    const newSourceText = sourceText.substr(0, relativeImport.moduleSpecifier.pos + 1) + newImportValue + sourceText.substr(relativeImport.moduleSpecifier.end);

    let newSource = source.update(newSourceText,
      {
        span: {
          start: 0,
          length: sourceText.length,
        },
        newLength: newSourceText.length
      } as TextChangeRange);

    const nextRelativeImport = this.extractRelativeImport(newSource);
    if (nextRelativeImport) {
      newSource = this.modifyRelativeImports(newSource, nextRelativeImport)
    }
    return newSource
  }

  private extractRelativeImport(value: ts.SourceFile) {

    return ts.forEachChild(value, node => {
      if (node.kind === ts.SyntaxKind.ImportDeclaration) {
        const importValue = (node as ImportDeclaration).moduleSpecifier.getText();
        if (importValue.match(/\.\.\/|\.\/(.+)\//)) {
          return (node as ImportDeclaration);
        }
      }
    });
  }

  private async importInternalData(importStatement: Promise<{ default: string; }>) {
    try {
      const file = await importStatement;
      return file.default;
    } catch (err) {
      return `ERROR INITIALIZING FILE: ${err}`;
    }
  }

  private onTabClick(file: string) {
    if (this.state.currentFile !== file) {
      this.setState({ currentFile: file });
    }
  }

  public render() {
    const { files, ...editorProps } = this.props;
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <TabNavigation currentFile={this.state.currentFile} files={(this.state.files || []).filter((file) => !file.name.match(/s?css$/gi)) as NavigationFile[]} onTabClick={this.onTabClick} showClose={false} >
        </TabNavigation>
        <div style={{ height: this.props.height || "100%", width: this.props.width || "100%", display: this.state.files ? undefined : "none" }}>
          <MonacoEditor {...editorProps} readonly={true} files={this.state.files} currentFile={this.state.currentFile} modules={modules} />
        </div>
        <div className="loading-content" style={{ height: this.props.height || "100%", width: this.props.width || "100%", display: !this.state.files ? undefined : "none" }}>
          <div className="spinner-container">
            <div className="spinner codicon codicon-loading"></div>
          </div>
        </div>
      </div>
    );
  }
}
