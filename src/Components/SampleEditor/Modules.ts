/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { IExternalModule, IInternalModule, IModule } from "@bentley/monaco-editor/editor";
export const modules: IModule[] = [
    ({
        name: "react",
        import: import("react"),
    } as IInternalModule),
    ({
        name: "react-dom",
        import: import("react-dom"),
    } as IInternalModule),
    ({
        name: "@bentley/bentleyjs-core",
        import: import("@bentley/bentleyjs-core"),
    } as IInternalModule),
    ({
        name: "@bentley/context-registry-client",
        import: import("@bentley/context-registry-client"),
    } as IInternalModule),
    ({
        name: "@bentley/frontend-authorization-client",
        import: import("@bentley/frontend-authorization-client"),
    } as IInternalModule),
    ({
        name: "@bentley/geometry-core",
        import: import("@bentley/geometry-core"),
    } as IInternalModule),
    ({
        name: "@bentley/imodelhub-client",
        import: import("@bentley/imodelhub-client"),
    } as IInternalModule),
    ({
        name: "@bentley/imodeljs-common",
        import: import("@bentley/imodeljs-common"),
    } as IInternalModule),
    ({
        name: "@bentley/imodeljs-frontend",
        import: import("@bentley/imodeljs-frontend"),
    } as IInternalModule),
    ({
        name: "@bentley/imodeljs-i18n",
        import: import("@bentley/imodeljs-i18n"),
    } as IInternalModule),
    ({
        name: "@bentley/imodeljs-quantity",
        import: import("@bentley/imodeljs-quantity"),
    } as IInternalModule),
    ({
        name: "@bentley/itwin-client",
        import: import("@bentley/itwin-client"),
    } as IInternalModule),
    ({
        name: "@bentley/ui-abstract",
        import: import("@bentley/ui-abstract"),
    } as IInternalModule),
    ({
        name: "@bentley/ui-components",
        import: import("@bentley/ui-components"),
    } as IInternalModule),
    ({
        name: "@bentley/ui-core",
        import: import("@bentley/ui-core"),
    } as IInternalModule),
    ({
        name: "@bentley/presentation-frontend",
        import: import("@bentley/presentation-frontend"),
    } as IInternalModule),
    ({
        name: "@bentley/presentation-common",
        import: import("@bentley/presentation-common"),
    } as IInternalModule),
    ({
        name: "@bentley/presentation-components",
        import: import("@bentley/presentation-components"),
    } as IInternalModule),
    ({
        name: "@bentley/product-settings-client",
        import: import("@bentley/product-settings-client"),
    } as IInternalModule),
    ({
        name: "@bentley/orbitgt-core",
        import: import("@bentley/orbitgt-core"),
    } as IInternalModule),
    ({
        name: "@bentley/webgl-compatibility",
        import: import("@bentley/webgl-compatibility"),
    } as IInternalModule),
    ({
        name: "api/viewSetup",
        import: import("../../api/viewSetup"),
        typedef: import("!!raw-loader!../../api/viewSetup.d.ts"),
    } as IInternalModule),
    ({
        name: "api/showcasetooladmin",
        import: import("../../api/showcasetooladmin"),
        typedef: import("!!raw-loader!../../api/showcasetooladmin.d.ts"),
    } as IInternalModule),
    ({
        name: "common/CommonComponentTools/ComponentContainer",
        import: import("../../common/CommonComponentTools/ComponentContainer"),
        typedef: import("!!raw-loader!../../common/CommonComponentTools/ComponentContainer.d.ts"),
    } as IInternalModule),
    ({
        name: "common/DataProvider/SampleDataProvider",
        import: import("../../common/DataProvider/SampleDataProvider"),
        typedef: import("!!raw-loader!../../common/DataProvider/SampleDataProvider.d.ts"),
    } as IInternalModule),
    ({
        name: "common/PointSelector/PointGenerators",
        import: import("../../common/PointSelector/PointGenerators"),
        typedef: import("!!raw-loader!../../common/PointSelector/PointGenerators.d.ts"),
    } as IInternalModule),
    ({
        name: "common/PointSelector/PointSelector",
        import: import("../../common/PointSelector/PointSelector"),
        typedef: import("!!raw-loader!../../common/PointSelector/PointSelector.d.ts"),
    } as IInternalModule),
    ({
        name: "Components/Viewport/ReloadableViewport",
        import: import("../Viewport/ReloadableViewport"),
        typedef: import("!!raw-loader!../Viewport/ReloadableViewport.d.ts"),
    } as IInternalModule),
    ({
        name: "Components/ControlPane/ControlPane",
        import: import("../ControlPane/ControlPane"),
        typedef: import("!!raw-loader!../ControlPane/ControlPane.d.ts"),
    } as IInternalModule),
    ({
        name: "common/SampleApp",
        import: import("../../common/SampleApp"),
        typedef: import("!!raw-loader!../../common/SampleApp.d.ts"),
    } as IInternalModule),
    ({
        name: "common/CommonComponentTools/index.scss",
        import: import("!!raw-loader!common/CommonComponentTools/index.scss"),
    } as IInternalModule),
    ({
        name: "common/GeometryCommon/BlankViewport",
        import: import("../../common/GeometryCommon/BlankViewport"),
        typedef: import("!!raw-loader!../../common/GeometryCommon/BlankViewport.d.ts"),
    } as InternalModule),
    ({
        name: "common/GeometryCommon/GeometryDecorator",
        import: import("../../common/GeometryCommon/GeometryDecorator"),
        typedef: import("!!raw-loader!../../common/GeometryCommon/GeometryDecorator.d.ts"),
    } as InternalModule),
    ({
        name: "common/DataProvider/Trees.scss",
        import: import("!!raw-loader!common/DataProvider/Trees.scss"),
    } as IInternalModule),
    ({
        name: "common/samples-common.scss",
        import: import("!!raw-loader!common/samples-common.scss"),
    } as IInternalModule),
    ({
        name: "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css",
        import: import("!!raw-loader!@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css"),
    } as IInternalModule),
    ({
        name: "react",
    } as IExternalModule),
    ({
        name: "react-dom",
    } as IExternalModule),
];
