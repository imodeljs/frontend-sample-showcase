/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { Fragment } from "react";
import { shallow } from "enzyme";
import { App } from "../Components/App/App";
import { SampleShowcase } from "../Components/SampleShowcase/SampleShowcase";
import { SampleGallery } from "../Components/SampleGallery/SampleGallery";
import { IModelSelector } from "../Components/IModelSelector/IModelSelector";
import { ReloadableViewport } from "../Components/Viewport/ReloadableViewport";
import { StartupComponent } from "../Components/Startup/Startup";
import { GithubLink } from "../Components/GithubLink";

beforeAll(async () => {
});

afterEach(async () => {
});

test("smoke tests", () => {
  // App
  const appShallow = shallow(<App />);
  expect(appShallow.containsAllMatchingElements([<SampleShowcase />])).toEqual(true);

  // SampleShowcase
  shallow(<SampleShowcase />);

  // Github link
  const githubLinkShallow = shallow(<GithubLink linkTarget="test" />);
  expect(githubLinkShallow.containsAllMatchingElements([<a href="test" target="_blank" rel="noopener noreferrer"><img src="GitHub-Mark-32px.png" alt="Github Link" title="View source on Github" /></a>])).toBe(true);

  // ReloadableViewport
  shallow(<ReloadableViewport iModelName={"test"} onIModelReady={() => { }} />);

  shallow(<SampleGallery entries={[]} selected={"test"} onChange={() => { }} />);
  const iModelSelectorShallow = shallow(<IModelSelector iModelNames={["test1", "test2"]} iModelName={"test2"} onIModelChange={() => { }} />);
  expect(iModelSelectorShallow.containsAllMatchingElements([<span>Pick model to view it:</span>, <select value={1}><option value={0}>test1</option><option value={1}>test2</option></select>])).toEqual(true);
});
