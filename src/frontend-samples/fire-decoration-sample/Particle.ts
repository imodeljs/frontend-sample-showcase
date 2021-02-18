/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { RenderTexture } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator } from "@bentley/imodeljs-frontend";

// export interface SnowParticle extends ParticleProps {

// }

// export class SnowDecorator implements Decorator {

//   public readonly dispose: VoidFunction;

//   public readonly _particles: SnowParticle;
//   public readonly _texture?: RenderTexture;
//   private _lastUpdateTime: number;

//   constructor() {
//     ParticleCollectionBuilder
//   }

//   public decorate(context: DecorateContext): void {
//     if (!this._texture)
//       return;

//     // Update the particles.
//     const now = Date.now();
//     const deltaMillis = now - this._lastUpdateTime;
//     this._lastUpdateTime = now;
//     this.updateParticles(deltaMillis / 1000);

//     // Create particle graphics.
//     const builder = ParticleCollectionBuilder.create({
//       viewport: this.viewport,
//       isViewCoords: true,
//       texture: this._texture,
//       size: (this._params.sizeRange.high - this._params.sizeRange.low) / 2,
//     });

//     for (const particle of this._particles)
//       builder.addParticle(particle);

//     const graphic = builder.finish();
//     if (graphic)
//       context.addDecoration(GraphicType.ViewOverlay, graphic);
//   }
// }
