const { Builder, By, until } = require('selenium-webdriver');

async function testSamples(driver, samples) {
  for (sample in samples) {
    // Class imodeljs-vp only appears on successful open.
    await driver.wait(until.elementLocated(By.className("imodeljs-vp")), 40000);

    const viewportImage = await driver.wait(until.elementLocated(By.xpath("//img[@src='" + samples[sample] + "-thumbnail.png']")), 30000);
    await viewportImage.click();

    // Very first sample doesn't change the URL.
    if (sample !== '0' && samples[sample] !== "viewport-only") {
      await driver.wait(until.urlContains(samples[sample]), 3000);
    }
  }
}

(async function testSampleShowcase() {
  let driver = new Builder()
    .forBrowser('chrome')
    .build();

  try {
    await driver.get('https://www.itwinjs.org/sample-showcase/frontend-sample-showcase/');

    const viewerSamples = [
      "viewport-only",
      "viewer-only-2d",
      "reality-data",
      "view-attributes"
    ]

    const viewerFeatureSamples = [
      "display-styles",
      "classifier",
      "emphasize-elements",
      "heatmap-decorator",
      "image-export",
      "cross-probing",
      "marker-pin",
      "multi-viewport",
      "property-formatting",
      "read-settings",
      "shadow-study",
      "swiping-viewport",
      "thematic-display",
      "tooltip-customize",
      "view-clip",
      "volume-query",
      "zoom-to-elements"
    ]

    await testSamples(driver, viewerSamples);
    await driver.findElement(By.xpath("//div[@title=\"Viewer Features\"]")).click();
    await testSamples(driver, viewerFeatureSamples);
    await driver.findElement(By.xpath("//div[@title=\"UI Components\"]")).click();

  } finally {
    await driver.quit();
  }
})();


