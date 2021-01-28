const { Builder, By, until } = require('selenium-webdriver');


(async function example() {
  let driver = new Builder()
    .forBrowser('chrome')
    .build();

  try {
    await driver.get('https://www.itwinjs.org/sample-showcase/frontend-sample-showcase/');

    const samples = [
      "viewport-only",
      "viewer-only-2d",
      "reality-data",
      "view-attributes"
    ]

    for (sample in samples) {
      const viewportImage = await driver.wait(until.elementLocated(By.xpath("//img[@src='" + samples[sample] + "-thumbnail.png']")), 30000);
      await viewportImage.click();

      // First click doesn't change the url.
      if (sample !== '0') {
        await driver.wait(until.urlContains(samples[sample]), 3000);
      }
    }

  } finally {
    await driver.quit();
  }
})();


