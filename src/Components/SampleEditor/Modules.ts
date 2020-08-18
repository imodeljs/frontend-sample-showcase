/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { ExternalModule, InternalModule, ModuleBase } from "@bentley/monaco-editor";
export const modules: ModuleBase[] = [
    ({
        name: "react",
        import: import("react"),
    } as InternalModule),
    ({
        name: "react-dom",
        import: import("react-dom"),
    } as InternalModule),
    ({
        name: "@bentley/bentleyjs-core",
        import: import("@bentley/bentleyjs-core"),
    } as InternalModule),
    ({
        name: "@bentley/context-registry-client",
        import: import("@bentley/context-registry-client"),
    } as InternalModule),
    ({
        name: "@bentley/frontend-authorization-client",
        import: import("@bentley/frontend-authorization-client"),
    } as InternalModule),
    ({
        name: "@bentley/geometry-core",
        import: import("@bentley/geometry-core"),
    } as InternalModule),
    ({
        name: "@bentley/imodelhub-client",
        import: import("@bentley/imodelhub-client"),
    } as InternalModule),
    ({
        name: "@bentley/imodeljs-common",
        import: import("@bentley/imodeljs-common"),
    } as InternalModule),
    ({
        name: "@bentley/imodeljs-frontend",
        import: import("@bentley/imodeljs-frontend"),
    } as InternalModule),
    ({
        name: "@bentley/imodeljs-i18n",
        import: import("@bentley/imodeljs-i18n"),
    } as InternalModule),
    ({
        name: "@bentley/imodeljs-quantity",
        import: import("@bentley/imodeljs-quantity"),
    } as InternalModule),
    ({
        name: "@bentley/itwin-client",
        import: import("@bentley/itwin-client"),
    } as InternalModule),
    ({
        name: "@bentley/ui-abstract",
        import: import("@bentley/ui-abstract"),
    } as InternalModule),
    ({
        name: "@bentley/ui-components",
        import: import("@bentley/ui-components"),
    } as InternalModule),
    ({
        name: "@bentley/ui-core",
        import: import("@bentley/ui-core"),
    } as InternalModule),
    ({
        name: "@bentley/presentation-frontend",
        import: import("@bentley/presentation-frontend"),
    } as InternalModule),
    ({
        name: "@bentley/presentation-common",
        import: import("@bentley/presentation-common"),
    } as InternalModule),
    ({
        name: "@bentley/presentation-components",
        import: import("@bentley/presentation-components"),
    } as InternalModule),
    ({
        name: "@bentley/product-settings-client",
        import: import("@bentley/product-settings-client"),
    } as InternalModule),
    ({
        name: "@bentley/orbitgt-core",
        import: import("@bentley/orbitgt-core"),
    } as InternalModule),
    ({
        name: "@bentley/webgl-compatibility",
        import: import("@bentley/webgl-compatibility"),
    } as InternalModule),
    ({
        name: "api/viewSetup",
        import: import("../../api/viewSetup"),
        typedef: import("!!raw-loader!../../api/viewSetup.d.ts"),
    } as InternalModule),
    ({
        name: "api/showcasetooladmin",
        import: import("../../api/showcasetooladmin"),
        typedef: import("!!raw-loader!../../api/showcasetooladmin.d.ts"),
    } as InternalModule),
    ({
        name: "common/CommonComponentTools/ComponentContainer",
        import: import("../../common/CommonComponentTools/ComponentContainer"),
        typedef: import("!!raw-loader!../../common/CommonComponentTools/ComponentContainer.d.ts"),
    } as InternalModule),
    ({
        name: "common/DataProvider/SampleDataProvider",
        import: import("../../common/DataProvider/SampleDataProvider"),
        typedef: import("!!raw-loader!../../common/DataProvider/SampleDataProvider.d.ts"),
    } as InternalModule),
    ({
        name: "common/PointSelector/PointGenerators",
        import: import("../../common/PointSelector/PointGenerators"),
        typedef: import("!!raw-loader!../../common/PointSelector/PointGenerators.d.ts"),
    } as InternalModule),
    ({
        name: "common/PointSelector/PointSelector",
        import: import("../../common/PointSelector/PointSelector"),
        typedef: import("!!raw-loader!../../common/PointSelector/PointSelector.d.ts"),
    } as InternalModule),
    ({
        name: "Components/Viewport/ReloadableViewport",
        import: import("../Viewport/ReloadableViewport"),
        typedef: import("!!raw-loader!../Viewport/ReloadableViewport.d.ts"),
    } as InternalModule),
    ({
        name: "common/SampleApp",
        import: import("../../common/SampleApp"),
        typedef: import("!!raw-loader!../../common/SampleApp.d.ts"),
    } as InternalModule),
    ({
        name: "common/CommonComponentTools/index.scss",
        import: import("!!raw-loader!common/CommonComponentTools/index.scss"),
    } as InternalModule),
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
    } as InternalModule),
    ({
        name: "common/samples-common.scss",
        import: import("!!raw-loader!common/samples-common.scss"),
    } as InternalModule),
    ({
        name: "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css",
        import: import("!!raw-loader!@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css"),
    } as InternalModule),
    ({
        name: "react",
    } as ExternalModule),
    ({
        name: "react-dom",
    } as ExternalModule),
];
