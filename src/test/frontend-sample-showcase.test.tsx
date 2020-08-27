/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* tslint:disable:no-console */
import { expect } from "chai";
import RealityDataApp from "frontend-samples/reality-data-sample/RealityDataApp";
// tslint:disable-next-line:no-direct-imports
import * as TypeMoq from "typemoq";
import { Range3d } from "@bentley/geometry-core";
import { ContextRealityModelProps } from "@bentley/imodeljs-common";
import { EmphasizeElements, IModelApp, IModelAppOptions, IModelConnection, MockRender, ScreenViewport } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { EmphasizeAction } from "../frontend-samples/emphasize-elements-sample/EmphasizeElementsApp";
import ShadowStudyApp from "../frontend-samples/shadow-study-sample/ShadowStudyApp";
import ThematicDisplayApp from "../frontend-samples/thematic-display-sample/ThematicDisplayApp";
import ViewClipApp from "../frontend-samples/view-clip-sample/ViewClipApp";
import { TestUtilities } from "./utils/testUtilities";

describe("View Clipping Sample", () => {
  const imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();

  before(async () => {
    await TestApp.startup();
    imodelMock.setup((_) => _.displayedExtents).returns(() => new Range3d(1, 1, 1, 1, 1, 1));
  });

  after(() => TestApp.shutdown());

  it("Adds a view clip plane to the viewport", () => {
    const vp: ScreenViewport = TestUtilities.getScreenViewport();
    if (vp) {
      ViewClipApp.setClipPlane(vp, "0", imodelMock.object as IModelConnection);
      expect(vp.view.getViewClip()).to.not.be.undefined;
      ViewClipApp.clearClips(vp);
    } else {
      expect(true).to.be.false;
    }
  });

  it("Adds a view clip range to the viewport", () => {
    const vp: ScreenViewport = TestUtilities.getScreenViewport();
    if (vp) {
      ViewClipApp.addExtentsClipRange(vp);
      expect(vp.view.getViewClip()).to.not.be.undefined;
      ViewClipApp.clearClips(vp);
    } else {
      expect(true).to.be.false;
    }
  });
});

describe("Thematic display", () => {
  const imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();

  before(async () => {
    await TestApp.startup();
    imodelMock.setup((_) => _.displayedExtents).returns(() => new Range3d(1, 1, 1, 1, 1, 1));
  });

  after(() => TestApp.shutdown());

  it("Turns thematic display on/off", () => {
    const vp: ScreenViewport = TestUtilities.getScreenViewport();
    ThematicDisplayApp.setThematicDisplayOnOff(vp, false);
    expect(vp.viewFlags.thematicDisplay).to.equal(false);
    ThematicDisplayApp.setThematicDisplayOnOff(vp, true);
    expect(vp.viewFlags.thematicDisplay).to.equal(true);

  });
});

describe("Shadow Study", () => {
  const imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();

  before(async () => {
    await TestApp.startup();
    imodelMock.setup((_) => _.displayedExtents).returns(() => new Range3d(1, 1, 1, 1, 1, 1));
  });

  after(() => TestApp.shutdown());

  it("Sets sun time", () => {
    const time: number = 123;
    IModelApp.viewManager.setSelectedView(TestUtilities.getScreenViewport());

    const vp = IModelApp.viewManager.selectedView;
    if (vp && vp.view.is3d()) {
      const displayStyle = vp.view.getDisplayStyle3d();

      // Should be null
      let oldLights = displayStyle.settings.lights;
      ShadowStudyApp.updateSunTime(time);

      // Expect the lights to be set and to have solar property
      expect(displayStyle.settings.lights).to.not.equal(oldLights);
      expect(displayStyle.settings.lights).to.have.property("solar");

      // Test updating lights again
      oldLights = displayStyle.settings.lights;
      ShadowStudyApp.updateSunTime(4321);
      expect(displayStyle.settings.lights).to.not.equal(oldLights);
      expect(displayStyle.settings.lights).to.have.property("solar");
    } else {
      expect(false).to.be.true;
    }
  });
});

describe("Emphasize Elements", () => {
  const imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();

  before(async () => {
    await TestApp.startup();
    imodelMock.setup((_) => _.displayedExtents).returns(() => new Range3d(1, 1, 1, 1, 1, 1));
  });

  after(() => TestApp.shutdown());

  it("Emphasizes some elements", () => {
    IModelApp.viewManager.setSelectedView(TestUtilities.getScreenViewport());
    const vp = IModelApp.viewManager.selectedView;

    if (vp) {
      const emphasizeElem = EmphasizeElements.getOrCreate(vp);
      const oldEmphasizedElms = emphasizeElem.getEmphasizedElements(vp);
      expect(oldEmphasizedElms).to.be.undefined;

      // Select some elements and run EmphasizeAction
      const ids = new Set<string>();
      ids.add("0x1"); ids.add("0x2"); ids.add("0x3");

      vp.view.iModel.selectionSet.add(ids);
      new EmphasizeAction(true).run();

      // Expect emphasized elements to be changed
      expect(emphasizeElem.getEmphasizedElements(vp)).to.not.equal(oldEmphasizedElms);
    } else {
      expect(false).to.be.true;
    }
  });
});

describe("Reality Data", () => {
  const imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();

  before(async () => {
    await TestApp.startup();
    imodelMock.setup((_) => _.displayedExtents).returns(() => new Range3d(1, 1, 1, 1, 1, 1));
  });

  after(() => TestApp.shutdown());

  it("Removes reality data models", () => {
    IModelApp.viewManager.setSelectedView(TestUtilities.getScreenViewport());
    const vp = IModelApp.viewManager.selectedView;

    if (vp) {
      // First attach a fake reality model so the remove behavior can be tested
      const crmProp: ContextRealityModelProps = { tilesetUrl: "FakeURL", name: "FakeName" };
      vp.displayStyle.attachRealityModel(crmProp);
      let models: number = 0;
      let style = vp.displayStyle.clone();
      style.forEachRealityModel(
        () => models++,
      );

      // Expect the fake reality model to be added
      expect(models).to.equal(1);
      models = 0;

      // Toggle off all reality models
      // tslint:disable-next-line: no-floating-promises
      RealityDataApp.toggleRealityModel(false, vp, imodelMock.object as IModelConnection);
      style = vp.displayStyle.clone();
      style.forEachRealityModel(
        () => models++,
      );

      // Expect no reality models
      expect(models).to.equal(0);
    } else {
      expect(false).to.be.true;
    }
  });
});

class TestApp extends MockRender.App {
  public static testNamespace?: I18NNamespace;

  public static async startup(opts?: IModelAppOptions): Promise<void> {
    opts = opts ? opts : {};
    opts.i18n = this.supplyI18NOptions();
    await IModelApp.startup(
      opts,
    );
    this.testNamespace = IModelApp.i18n.registerNamespace("TestApp");
    IModelApp.toolAdmin.onInitialized();
  }

  protected static supplyI18NOptions() { return { urlTemplate: `${window.location.origin}/locales/{{lng}}/{{ns}}.json` }; }
}
