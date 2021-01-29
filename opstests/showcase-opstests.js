/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

const SHOWCASE_URL = "https://www.itwinjs.org/sample-showcase/frontend-sample-showcase/";
const TIMEOUT = 40000;

(async function testSampleShowcase() {

  const driver = new Builder()
    .forBrowser("chrome")
    .build();

  try {
    await driver.get(SHOWCASE_URL);

    await openAlliModels(driver);
    await testSamples(driver);

  } catch (error) {
    if (error.name === "UnexpectedAlertOpenError") {
      console.error("Error: Sample failed to open iModel");
      console.error(await driver.getCurrentUrl());
    } else {
      console.error(error);
    }
  } finally {
    await driver.quit();
  }
})();

// For first sample, attempt to open all available imodel options.
async function openAlliModels(driver) {
  const allModels = await driver.wait(until.elementsLocated(By.css("option")), TIMEOUT);
  for (model in allModels) {
    await allModels[model].click();
    await driver.wait(until.elementLocated(By.className("imodeljs-vp")), TIMEOUT);
  }
}

async function testSamples(driver) {
  const allGroups = await driver.wait(until.elementsLocated(By.className("uicore-expandable-blocks-block")), TIMEOUT);
  await driver.wait(until.elementLocated(By.className("imodeljs-vp")), TIMEOUT);

  for (group in allGroups) {

    await allGroups[group].click();

    const allSamples = await driver.wait(until.elementsLocated(By.className("gallery-card-radio-btn")), TIMEOUT);
    for (sample in allSamples) {
      await allSamples[sample].click();

      // We cannot test for length By.id.
      await driver.findElement(By.id("component-container")).then(() => {
        // Move on.
      }).catch(async () => {
        const trees = await driver.findElements(By.className("sample-tree"));
        if (trees.length > 0) {
          // Move on.
        } else {
          await driver.wait(until.elementLocated(By.className("imodeljs-vp")), TIMEOUT);
        }
      })
    }
  }
}
