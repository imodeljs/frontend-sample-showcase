/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert, expect } from "chai";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { AccuDraw, IdleTool, IModelApp, IModelAppOptions, MockRender, PanViewTool, SelectionTool, Tool } from "@bentley/imodeljs-frontend";
import { ViewClipUI } from "../frontend-samples/view-clip-sample";
import * as React from "react";
import { shallow } from "enzyme";

describe.only("View Clipping Sample", () => {
  before(async () => {
    await TestApp.startup();
  });
  after(() => TestApp.shutdown());

  it("Adds a view clip to the viewport", () => {
    const viewClipUIComponent = shallow(<ViewClipUI iModelName="test" />);
    viewClipUIComponent.setState({ showClipBlock: true, clipPlane: "0" });
    expect(IModelApp.viewManager.selectedView).to.not.be.undefined;

  });
});

/** class to simulate overriding the default AccuDraw */
class TestAccuDraw extends AccuDraw { }

/** class to simulate overriding the Idle tool */
class TestIdleTool extends IdleTool { }

let testVal1: string;
let testVal2: string;

/** class to test immediate tool */
class TestImmediate extends Tool {
  public static toolId = "Test.Immediate";
  constructor(val1: string, val2: string) { testVal1 = val1; testVal2 = val2; super(); }
}

class TestSelectTool extends SelectionTool { }

class TestApp extends MockRender.App {
  public static testNamespace?: I18NNamespace;

  public static async startup(opts?: IModelAppOptions): Promise<void> {
    opts = opts ? opts : {};
    opts.accuDraw = new TestAccuDraw();
    opts.i18n = this.supplyI18NOptions();
    await MockRender.App.startup(opts);

    this.testNamespace = IModelApp.i18n.registerNamespace("TestApp");
    TestImmediate.register(this.testNamespace);
    TestIdleTool.register();
    TestSelectTool.register();
    IModelApp.toolAdmin.onInitialized();

    // register an anonymous class with the toolId "Null.Tool"
    const testNull = class extends Tool { public static toolId = "Null.Tool"; public run() { testVal1 = "fromNullTool"; return true; } };
    testNull.register(this.testNamespace);
  }

  protected static supplyI18NOptions() { return { urlTemplate: `${window.location.origin}/locales/{{lng}}/{{ns}}.json` }; }
}

describe.skip("IModelApp", () => {
  before(async () => TestApp.startup());
  after(() => TestApp.shutdown());

  it("TestApp should override correctly", () => {
    assert.instanceOf(IModelApp.accuDraw, TestAccuDraw, "accudraw override");
    assert.instanceOf(IModelApp.toolAdmin.idleTool, TestIdleTool, "idle tool override");
    assert.isTrue(IModelApp.tools.run("Test.Immediate", "test1", "test2"), "immediate tool ran");
    assert.equal(testVal1, "test1", "arg1 was correct");
    assert.equal(testVal2, "test2", "arg2 was correct");
    assert.isFalse(IModelApp.tools.run("Not.Found"), "toolId is not registered");
    assert.isTrue(IModelApp.tools.run("View.Pan"), "run view pan");
    assert.instanceOf(IModelApp.toolAdmin.viewTool, PanViewTool, "pan tool is active");

    assert.isTrue(IModelApp.tools.run("Null.Tool"), "run null");
    assert.equal(testVal1, "fromNullTool");
  });

  it("Should return the key for localization keys that are missing", () => {
    // there is no key for TrivialTest.Test3
    assert.equal(IModelApp.i18n.translate("TestApp:TrivialTests.Test3"), "TrivialTests.Test3");
  });

  it("Should support WebGL", () => {
    expect(IModelApp.hasRenderSystem).to.be.true;
    let canvas = document.getElementById("WebGLTestCanvas") as HTMLCanvasElement;
    if (null === canvas) {
      canvas = document.createElement("canvas") as HTMLCanvasElement;
      if (null !== canvas) {
        canvas.id = "WebGLTestCanvas";
        document.body.appendChild(document.createTextNode("WebGL tests"));
        document.body.appendChild(canvas);
      }
    }
    canvas.width = 300;
    canvas.height = 150;
    expect(canvas).not.to.be.undefined;
    if (undefined !== canvas) {
      const context = canvas.getContext("webgl");
      expect(context).not.to.be.null;
      expect(context).not.to.be.undefined;
    }
  });

  it("Should create mock render system without WebGL", () => {
    expect(IModelApp.hasRenderSystem).to.be.true;
    expect(IModelApp.renderSystem).instanceof(MockRender.System);
  });

});
