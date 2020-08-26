import {
  DisplayStyle3dSettingsProps,
  RenderMode,
  ThematicDisplayMode,
  ThematicGradientColorScheme,
  ThematicGradientMode,
  ViewFlagProps,
} from "@bentley/imodeljs-common";

const renderingStyleViewFlags: ViewFlagProps = {
  noConstruct: true,
  noCameraLights: false,
  noSourceLights: false,
  noSolarLight: false,
  visEdges: false,
  hidEdges: false,
  shadows: false,
  monochrome: false,
  ambientOcclusion: false,
  thematicDisplay: false,
  renderMode: RenderMode.SmoothShade,
};

export interface DisplayStyle extends DisplayStyle3dSettingsProps {
  name: string;
}

export const displayStyles: DisplayStyle[] = [{
  name: "Custom",
  // Add style here

}, {
  name: "Default",
  environment: {
    sky: {
      display: true, twoColor: false, groundColor: 8228728, zenithColor: 16741686, nadirColor: 3880, skyColor: 16764303,
    },
    ground: {
      display: false, elevation: -0.01, aboveColor: 32768, belowColor: 1262987,
    },
  },
  viewflags: renderingStyleViewFlags,
  lights: {
    solar: { direction: [-0.9833878378071199, -0.18098510351728977, 0.013883542698953828] },
  },
}, {
  name: "Illustration",
  environment: {},
  backgroundColor: 10921638,
  viewflags: { ...renderingStyleViewFlags, noCameraLights: true, noSourceLights: true, noSolarLight: true, visEdges: true },
  lights: {
    solar: { direction: [-0.9833878378071199, -0.18098510351728977, 0.013883542698953828] },
  },
  hline: {
    visible: { ovrColor: true, color: 0, pattern: 0, width: 1 },
    hidden: { ovrColor: false, color: 16777215, pattern: 3435973836, width: 0 },
    transThreshold: 1,
  },
}, {
  name: "Sun-dappled",
  environment: {
    sky: {
      display: true, twoColor: false, groundColor: 8228728, zenithColor: 16741686, nadirColor: 3880, skyColor: 16764303,
    },
    ground: {
      display: false, elevation: -0.01, aboveColor: 32768, belowColor: 1262987,
    },
  },
  viewflags: { ...renderingStyleViewFlags, shadows: true },
  lights: {
    solar: { direction: [0.9391245716329828, 0.10165764029437066, -0.3281931795832247] },
    hemisphere: { intensity: 0.2 },
    portrait: { intensity: 0 },
  },
}, {
  name: "Comic Book",
  environment: {
    sky: { display: true, twoColor: false, groundColor: 8228728, zenithColor: 16741686, nadirColor: 3880, skyColor: 16764303 },
    ground: { display: false, elevation: -0.01, aboveColor: 32768, belowColor: 1262987 },
  },
  viewflags: { ...renderingStyleViewFlags, noWeight: false, visEdges: true },
  hline: {
    visible: { ovrColor: true, color: 0, pattern: 0, width: 3 },
    transThreshold: 1,
  },
  lights: {
    solar: { direction: [0.7623, 0.0505, -0.6453], intensity: 1.95, alwaysEnabled: true },
    ambient: { intensity: 0.2 },
    portrait: { intensity: 0 },
    specularIntensity: 0,
    numCels: 2,
  },
}, {
  name: "Outdoorsy",
  environment: {
    sky: { display: true, twoColor: false, groundColor: 8228728, zenithColor: 16741686, nadirColor: 3880, skyColor: 16764303 },
    ground: { display: false, elevation: -0.01, aboveColor: 32768, belowColor: 1262987 },
  },
  viewflags: renderingStyleViewFlags,
  lights: {
    solar: { direction: [-0.9833878378071199, -0.18098510351728977, 0.013883542698953828], intensity: 1.05 },
    ambient: { intensity: 0.25 },
    hemisphere: {
      upperColor: { r: 206, g: 233, b: 255 },
      intensity: 0.5,
    },
    portrait: { intensity: 0 },
  },
}, {
  name: "Schematic",
  environment: {},
  backgroundColor: 16777215,
  viewflags: { ...renderingStyleViewFlags, visEdges: true },
  lights: {
    solar: { direction: [0, -0.6178171353958787, -0.7863218089378106], intensity: 1.95, alwaysEnabled: true },
    ambient: { intensity: 0.65 },
    portrait: { intensity: 0 },
    specularIntensity: 0,
  },
  hline: {
    visible: { ovrColor: true, color: 0, pattern: 0, width: 1 },
    hidden: { ovrColor: false, color: 16777215, pattern: 3435973836, width: 0 },
    transThreshold: 1,
  },
}, {
  name: "Soft",
  environment: {
    sky: { display: true, twoColor: false, groundColor: 8228728, zenithColor: 16741686, nadirColor: 3880, skyColor: 16764303 },
    ground: { display: false, elevation: -0.01, aboveColor: 32768, belowColor: 1262987 },
  },
  viewflags: { ...renderingStyleViewFlags, ambientOcclusion: true },
  lights: {
    solar: { direction: [-0.9833878378071199, -0.18098510351728977, 0.013883542698953828], intensity: 0 },
    ambient: { intensity: 0.75 },
    hemisphere: { intensity: 0.3 },
    portrait: { intensity: 0.5 },
    specularIntensity: 0.4,
  },
  ao: { bias: 0.25, zLengthCap: 0.0025, maxDistance: 100, intensity: 1, texelStepSize: 1, blurDelta: 1.5, blurSigma: 2, blurTexelStepSize: 1 },
}, {
  name: "Moonlit",
  environment: {
    sky: { display: true, twoColor: false, groundColor: 2435876, zenithColor: 0, nadirColor: 3880, skyColor: 3481088 },
    ground: { display: false, elevation: -0.01, aboveColor: 32768, belowColor: 1262987 },
  },
  viewflags: { ...renderingStyleViewFlags, visEdges: true },
  lights: {
    solar: { direction: [-0.9833878378071199, -0.18098510351728977, 0.013883542698953828], intensity: 3, alwaysEnabled: true },
    ambient: { intensity: 0.05 },
    hemisphere: { lowerColor: { r: 83, g: 100, b: 87 } },
    portrait: { intensity: 0 },
    specularIntensity: 0,
  },
  monochromeMode: 0,
  hline: {
    visible: { ovrColor: true, color: 0, pattern: -1, width: 0 },
    hidden: { ovrColor: false, color: 16777215, pattern: 3435973836, width: 0 },
    transThreshold: 1,
  },
  monochromeColor: 7897479,
}, {
  name: "Thematic: Height",
  viewflags: { ...renderingStyleViewFlags, thematicDisplay: true },
  thematic: {
    axis: [0, 0, 1],
    gradientSettings: { mode: ThematicGradientMode.SteppedWithDelimiter },
  },
  lights: {},
}, {
  name: "Thematic: Slope",
  viewflags: { ...renderingStyleViewFlags, thematicDisplay: true },
  thematic: {
    displayMode: ThematicDisplayMode.Slope,
    range: [0, 90],
    axis: [0, 0, 1],
    gradientSettings: {
      mode: ThematicGradientMode.Smooth,
      colorScheme: ThematicGradientColorScheme.Custom,
      customKeys: [
        { value: 0, color: 0x404040 },
        { value: 1, color: 0xffffff },
      ],
    },
  },
  lights: {},
}, {
  name: "Gloss",
  environment: {
    sky: { display: true, twoColor: false, groundColor: 8228728, zenithColor: 16741686, nadirColor: 3880, skyColor: 16764303 },
    ground: { display: false, elevation: -0.01, aboveColor: 32768, belowColor: 1262987 },
  },
  viewflags: { ...renderingStyleViewFlags, visEdges: true },
  lights: {
    solar: { direction: [-0.9833878378071199, -0.18098510351728977, 0.013883542698953828] },
    specularIntensity: 4.15,
  },
  hline: {
    visible: { ovrColor: true, color: 8026756, pattern: 0, width: 1 },
    hidden: { ovrColor: false, color: 16777215, pattern: 3435973836, width: 0 },
    transThreshold: 1,
  },
},
{
  name: "Forge Inspired",
  ao: {
    bias: 0.25,
    blurDelta: 1,
    blurSigma: 2,
    blurTexelStepSize: 1,
    intensity: 1,
    maxDistance: 100,
    texelStepSize: 1,
    zLengthCap: 0.0025,
  },
  backgroundColor: 16777215,
  environment: {
    ground: { aboveColor: 25600, belowColor: 2179941, display: false, elevation: -0.01 },
    sky: { display: true, groundColor: 8228728, nadirColor: 13428479, skyColor: 16764303, twoColor: true, zenithColor: 16765341 },
  },
  hline: {
    hidden: { color: 16777215, ovrColor: false, pattern: 3435973836, width: 0 },
    transThreshold: 1,
    visible: {color: 6118749, ovrColor: true, pattern: 0, width: 1 }
  },
  lights: {
    ambient: {color: {b: 244, g: 244, r: 244}, intensity: 0.35},
    hemisphere: {
      lowerColor: {b: 204, g: 230, r: 255},
      upperColor: {b: 255, g: 209, r: 157}
    },
    portrait: {intensity: 0},
    solar: { alwaysEnabled: true, direction: [0.886852, 0.083601, -0.454427], intensity: 1.95 },
    specularIntensity: 0,
  },
  monochromeColor: 16777215,
  monochromeMode: 1,
  viewflags: {
    ...renderingStyleViewFlags,
    noConstruct: false,
  },
}];
