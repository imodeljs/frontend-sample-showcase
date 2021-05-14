/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import RealityDataApi from "frontend-samples/reality-data-sample/RealityDataApi";
import * as TypeMoq from "typemoq";
import { Range3d } from "@bentley/geometry-core";
import { ContextRealityModelProps, SpatialClassificationProps } from "@bentley/imodeljs-common";
import { EmphasizeElements, IModelApp, IModelAppOptions, IModelConnection, MockRender, ScreenViewport } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { EmphasizeAction } from "../frontend-samples/emphasize-elements-sample/EmphasizeElementsApi";
import ShadowStudyApp from "../frontend-samples/shadow-study-sample/ShadowStudyApi";
import ThematicDisplayApi from "../frontend-samples/thematic-display-sample/ThematicDisplayApi";
import ViewClipApp from "../frontend-samples/view-clip-sample/ViewClipApi";
import { TestUtilities } from "./utils/testUtilities";
import ClassifierApi from "frontend-samples/classifier-sample/ClassifierApi";

describe("View Clipping Sample", () => {
  const imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();

  before(async () => {
    await TestApp.startup();
    imodelMock.setup((_) => _.displayedExtents).returns(() => new Range3d(1, 1, 1, 1, 1, 1));
  });

  after(async () => TestApp.shutdown());

  it("Adds a view clip plane to the viewport", () => {
    const vp: ScreenViewport = TestUtilities.getScreenViewport();
    if (vp) {
      ViewClipApp.setClipPlane(vp, "0", imodelMock.object);
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

  after(async () => TestApp.shutdown());

  it("Turns thematic display on/off", () => {
    const vp: ScreenViewport = TestUtilities.getScreenViewport();
    ThematicDisplayApi.setThematicDisplayOnOff(vp, false);
    expect(vp.viewFlags.thematicDisplay).to.equal(false);
    ThematicDisplayApi.setThematicDisplayOnOff(vp, true);
    expect(vp.viewFlags.thematicDisplay).to.equal(true);

  });
});

describe("Shadow Study", () => {
  const imodelMock: TypeMoq.IMock<IModelConnection> = TypeMoq.Mock.ofType<IModelConnection>();

  before(async () => {
    await TestApp.startup();
    imodelMock.setup((_) => _.displayedExtents).returns(() => new Range3d(1, 1, 1, 1, 1, 1));
  });

  after(async () => TestApp.shutdown());

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

  after(async () => TestApp.shutdown());

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

  after(async () => TestApp.shutdown());

  it("Removes reality data models", () => {
    IModelApp.viewManager.setSelectedView(TestUtilities.getScreenViewport());
    const vp = IModelApp.viewManager.selectedView;

    if (vp) {
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
      RealityDataApi.toggleRealityModel(false, vp, imodelMock.object);
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

describe("Classifers", () => {
  before(async () => {
    await TestApp.startup();
  });

  after(async () => TestApp.shutdown());

  it("Updates classifiers", async () => {
    IModelApp.viewManager.setSelectedView(TestUtilities.getScreenViewport());
    const vp = IModelApp.viewManager.selectedView;

    if (vp) {
      const crmProp: ContextRealityModelProps = { tilesetUrl: "FakeURL", name: "FakeName" };
      vp.displayStyle.attachRealityModel(crmProp);
      const flags = new SpatialClassificationProps.Flags();
      flags.inside = SpatialClassificationProps.Display.On;
      flags.outside = SpatialClassificationProps.Display.Dimmed;
      const testClassifier: SpatialClassificationProps.Properties = { isActive: true, modelId: "TestId", expand: 1, name: "Test Name", flags };
      ClassifierApi.updateRealityDataClassifiers(vp, testClassifier);
      const style = vp.displayStyle.clone();
      style.forEachRealityModel(
        (model) => {
          expect(model.classifiers?.length).to.equal(1);
          expect(model.classifiers?.active?.name).to.equal("Test Name");
          expect(model.classifiers?.active?.modelId).to.equal("TestId");
          expect(model.classifiers?.active?.flags.inside).to.equal(1);
        }
      );
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
