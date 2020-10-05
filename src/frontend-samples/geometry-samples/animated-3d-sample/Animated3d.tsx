/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, AuxChannel, AuxChannelData, AuxChannelDataType, Cone, Point3d, PolyfaceAuxData, PolyfaceBuilder, Range3d, StrokeOptions } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
export default class Animated3d implements SampleApp {

  public static frameNum = 0;

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(new Range3d(-1, -1, -1, 2, 2, 2));
    BlankViewport.decorator = new GeometryDecorator(true, 100);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <BlankViewport force2d={false}></BlankViewport>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public static drawingCallback() {
    const options = StrokeOptions.createForFacets();
    options.shouldTriangulate = true;
    const builder = PolyfaceBuilder.create(options);
    const nDimensions = 50;
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
    const frameCount = 1000;

    const linearDisplacementDataVector = [], linearHeightDataVector = [], linearSlopeDataVector = [];
    const fraction = Animated3d.frameNum / (frameCount - 1);
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
    linearDisplacementDataVector.push(new AuxChannelData(Animated3d.frameNum, linearDisplacementData));
    linearHeightDataVector.push(new AuxChannelData(Animated3d.frameNum, linearHeightData));
    linearSlopeDataVector.push(new AuxChannelData(Animated3d.frameNum, linearSlopeData));

    auxChannels.push(new AuxChannel(linearDisplacementDataVector, AuxChannelDataType.Vector, "Linear Displacement", "Linear: Time"));
    auxChannels.push(new AuxChannel(linearHeightDataVector, AuxChannelDataType.Distance, "Linear Height", "Linear: Time"));
    auxChannels.push(new AuxChannel(linearSlopeDataVector, AuxChannelDataType.Scalar, "Linear Slope", "Linear: Time"));

    polyface.data.auxData = new PolyfaceAuxData(auxChannels, polyface.data.pointIndex);

    BlankViewport.decorator.addGeometry(polyface);
    console.log(Animated3d.frameNum)
    Animated3d.frameNum += 1;
  }
}
