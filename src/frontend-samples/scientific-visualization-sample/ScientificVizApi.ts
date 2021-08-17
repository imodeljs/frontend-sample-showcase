/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { Angle, AuxChannel, AuxChannelData, AuxChannelDataType, IModelJson, Point3d, Polyface, PolyfaceAuxData, PolyfaceBuilder, StrokeOptions, Transform } from "@bentley/geometry-core";
import { AnalysisStyle, AnalysisStyleProps, ThematicGradientColorScheme, ThematicGradientMode, ThematicGradientSettingsProps } from "@bentley/imodeljs-common";
import { jsonData } from "./Cantilever";

export type AnalysisMeshType = "Cantilever" | "Flat with waves";

export interface AnalysisMesh {
  readonly type: AnalysisMeshType;
  readonly polyface: Polyface;
  readonly styles: Map<string, AnalysisStyle | undefined>;
}

export default class ScientificVizApi {
  public static async createCantilever(): Promise<Polyface> {
    const polyface = IModelJson.Reader.parse(JSON.parse(jsonData)) as Polyface;
    const transform = Transform.createScaleAboutPoint(new Point3d(), 30);
    polyface.tryTransformInPlace(transform);
    return polyface;
  }

  public static populateAnalysisStyles(mesh: AnalysisMesh, displacementScale: number): void {
    const auxdata = mesh.polyface.data.auxData;
    if (!auxdata)
      return;

    mesh.styles.set("None", undefined);
    for (const channel of auxdata.channels) {
      if (undefined === channel.name || !channel.isScalar)
        continue;

      const displacementChannel = auxdata.channels.find((x) => x.inputName === channel.inputName && x.dataType === AuxChannelDataType.Vector);
      const thematicSettings: ThematicGradientSettingsProps = {};
      if (channel.name.endsWith("Height")) {
        thematicSettings.colorScheme = ThematicGradientColorScheme.SeaMountain;
        thematicSettings.mode = ThematicGradientMode.SteppedWithDelimiter;
      }

      assert(undefined !== channel.scalarRange);
      const props: AnalysisStyleProps = {
        scalar: {
          channelName: channel.name,
          range: channel.scalarRange,
          thematicSettings,
        },
      };

      let name = channel.name;
      if (undefined !== displacementChannel?.name) {
        props.displacement = { channelName: displacementChannel.name, scale: displacementScale };
        const exaggeration = 1 !== displacementScale ? "" : ` X ${displacementScale}`;
        name = `${name} and ${displacementChannel.name}${exaggeration}`;
      }

      mesh.styles.set(name, AnalysisStyle.fromJSON(props));
    }
  }

  public static createFlatMeshWithWaves(): Polyface {
    const options = StrokeOptions.createForFacets();
    options.shouldTriangulate = true;
    const builder = PolyfaceBuilder.create(options);
    const nDimensions = 100;
    const spacing = 1.0;

    /* Create a simple flat mesh with 10,000 points (100x100) */
    for (let iRow = 0; iRow < nDimensions - 1; iRow++) {
      for (let iColumn = 0; iColumn < nDimensions - 1; iColumn++) {
        const quad = [
          Point3d.create(iRow * spacing, iColumn * spacing, 0.0),
          Point3d.create((iRow + 1) * spacing, iColumn * spacing, 0.0),
          Point3d.create((iRow + 1) * spacing, (iColumn + 1) * spacing, 0.0),
          Point3d.create(iRow * spacing, (iColumn + 1) * spacing),
        ];
        builder.addQuadFacet(quad);
      }
    }

    const polyface = builder.claimPolyface();
    const zeroScalarData = [], zeroDisplacementData = [], radialHeightData = [], radialSlopeData = [], radialDisplacementData = [];
    const radius = nDimensions * spacing / 2.0;
    const center = new Point3d(radius, radius, 0.0);
    const maxHeight = radius / 4.0;
    const auxChannels = [];

    /** Create a radial wave - start and return to zero  */
    for (let i = 0; i < polyface.data.point.length; i++) {
      const angle = Angle.pi2Radians * polyface.data.point.distanceIndexToPoint(i, center)! / radius;
      const height = maxHeight * Math.sin(angle);
      const slope = Math.abs(Math.cos(angle));

      zeroScalarData.push(0.0);
      zeroDisplacementData.push(0.0);
      zeroDisplacementData.push(0.0);
      zeroDisplacementData.push(0.0);

      radialHeightData.push(height);
      radialSlopeData.push(slope);
      radialDisplacementData.push(0.0);
      radialDisplacementData.push(0.0);
      radialDisplacementData.push(height);
    }

    // Static Channels.
    auxChannels.push(new AuxChannel([new AuxChannelData(0.0, radialDisplacementData)], AuxChannelDataType.Vector, "Static Radial Displacement", "Radial: Static"));
    auxChannels.push(new AuxChannel([new AuxChannelData(1.0, radialHeightData)], AuxChannelDataType.Distance, "Static Radial Height", "Radial: Static"));
    auxChannels.push(new AuxChannel([new AuxChannelData(1.0, radialSlopeData)], AuxChannelDataType.Scalar, "Static Radial Slope", "Radial: Static"));

    // Animated Channels.
    const radialDisplacementDataVector = [new AuxChannelData(0.0, zeroDisplacementData), new AuxChannelData(1.0, radialDisplacementData), new AuxChannelData(2.0, zeroDisplacementData)];
    const radialHeightDataVector = [new AuxChannelData(0.0, zeroScalarData), new AuxChannelData(1.0, radialHeightData), new AuxChannelData(2.0, zeroScalarData)];
    const radialSlopeDataVector = [new AuxChannelData(0.0, zeroScalarData), new AuxChannelData(1.0, radialSlopeData), new AuxChannelData(2.0, zeroScalarData)];

    auxChannels.push(new AuxChannel(radialDisplacementDataVector, AuxChannelDataType.Vector, "Animated Radial Displacement", "Radial: Time"));
    auxChannels.push(new AuxChannel(radialHeightDataVector, AuxChannelDataType.Distance, "Animated Radial Height", "Radial: Time"));
    auxChannels.push(new AuxChannel(radialSlopeDataVector, AuxChannelDataType.Scalar, "Animated Radial Slope", "Radial: Time"));

    /** Create linear waves -- 10 separate frames.  */
    const waveHeight = radius / 20.0;
    const waveLength = radius / 2.0;
    const frameCount = 10;
    const linearDisplacementDataVector = [], linearHeightDataVector = [], linearSlopeDataVector = [];

    for (let i = 0; i < frameCount; i++) {
      const fraction = i / (frameCount - 1);
      const waveCenter = waveLength * fraction;
      const linearHeightData = [], linearSlopeData = [], linearDisplacementData = [];

      for (let j = 0; j < polyface.data.point.length; j++) {
        const point = polyface.data.point.getPoint3dAtUncheckedPointIndex(j);
        const theta = Angle.pi2Radians * (point.x - waveCenter) / waveLength;
        const height = waveHeight * Math.sin(theta);
        const slope = Math.abs(Math.cos(theta));

        linearHeightData.push(height);
        linearSlopeData.push(slope);
        linearDisplacementData.push(0.0);
        linearDisplacementData.push(0.0);
        linearDisplacementData.push(height);
      }
      linearDisplacementDataVector.push(new AuxChannelData(i, linearDisplacementData));
      linearHeightDataVector.push(new AuxChannelData(i, linearHeightData));
      linearSlopeDataVector.push(new AuxChannelData(i, linearSlopeData));
    }
    auxChannels.push(new AuxChannel(linearDisplacementDataVector, AuxChannelDataType.Vector, "Linear Displacement", "Linear: Time"));
    auxChannels.push(new AuxChannel(linearHeightDataVector, AuxChannelDataType.Distance, "Linear Height", "Linear: Time"));
    auxChannels.push(new AuxChannel(linearSlopeDataVector, AuxChannelDataType.Scalar, "Linear Slope", "Linear: Time"));

    polyface.data.auxData = new PolyfaceAuxData(auxChannels, polyface.data.pointIndex);
    return polyface;
  }

  public static async createMesh(type: AnalysisMeshType, displacementScale = 1): Promise<AnalysisMesh> {
    const polyface = "Flat with waves" === type ? ScientificVizApi.createFlatMeshWithWaves() : await ScientificVizApi.createCantilever();
    const styles = new Map<string, AnalysisStyle | undefined>();
    const mesh = { type, polyface, styles };
    ScientificVizApi.populateAnalysisStyles(mesh, displacementScale);
    return mesh;
  }
}