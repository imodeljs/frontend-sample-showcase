/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert, BeTimePoint, ByteStream, compareStrings } from "@bentley/bentleyjs-core";
import { Point3d, Range3d, Transform, Vector3d, XYZProps } from "@bentley/geometry-core";
import { ElementGraphicsRequestProps, FeatureAppearance, IModelTileRpcInterface, Placement3d, TileFormat, TileVersionInfo, ViewFlagOverrides } from "@bentley/imodeljs-common";
import { FeatureSymbology, GraphicBranch, ImdlReader, IModelApp, IModelConnection, RenderSystem, SceneContext, Tile, TileContent, TileDrawArgParams, TileDrawArgs, TileLoadPriority, TileRequest, TileTree, TileTreeOwner, TileTreeReference, TileTreeSupplier } from "@bentley/imodeljs-frontend";
import ExplodeApp from "./ExplodeApp";

/** Data describing an element for the exploded effect. */
interface ElementData {
  elementId: string;
  origin: Point3d;

  boundingBox: Range3d;
  transformWorld: Transform;
}

/** Information returned by the query for the elements to the backend. */
interface ElementDataProps {
  id: string;
  origin: XYZProps;
  bBoxHigh: XYZProps;
  bBoxLow: XYZProps;
  pitch: number;
  roll: number;
  yaw: number;
}

/** Parameters used to create a ElementTile. */
interface TileParams {
  centerOfMass: Point3d;
  versionInfo: TileVersionInfo;
  data: ElementData;
}

/** Identifies our TileTree for the supplier. */
interface ExplodeTreeId {
  name: string;
  ids: string[];
}

/** Parameters for creating a Tile Tree */
interface ExplodeTreeParams {
  objectName: string;
  data: ElementData[];
  iModel: IModelConnection;
  tileVersionInfo: TileVersionInfo;
}

/** Parameters for creating the overloaded draw argument. */
interface ExplodeTileDrawArgsParams extends TileDrawArgParams {
  explodeFactor: number;
}

/** Overloaded TileDrawArgs that also contain the current Explode Scaling Factor. */
class ExplodeTileDrawArgs extends TileDrawArgs {
  public explodeFactor: number;
  constructor(params: ExplodeTileDrawArgsParams) {
    super(params);
    this.explodeFactor = params.explodeFactor;
  }
}

/** Creates a transform matrix translating the range away from the point scaled by the factor. */
function calculateExplodeTransform(centerOfElement: Point3d, displaceOrigin: Point3d, explodeFactor: number) {
  const vector = Vector3d.createFrom(displaceOrigin);
  vector.subtractInPlace(centerOfElement);
  vector.scaleInPlace(explodeFactor - 1);
  return Transform.createTranslation(vector).inverse()!;
}

/** Creates a Range3d containing all the points using the Range3d API. */
function getRangeUnion(ranges: Range3d[]): Range3d {
  const range = Range3d.createNull();
  for (const r of ranges)
    range.extendRange(r);
  return range;
}

/** Handles the creation and getting of our TileTree for the TileTreeReference. */
class ExplodeTreeSupplier implements TileTreeSupplier {
  public ids: string[] = [];
  private _info: TileVersionInfo | undefined;

  /** Compare two tree Ids returning a negative number if lhs < rhs, a positive number if lhs > rhs, or 0 if the Ids are equivalent. */
  public compareTileTreeIds(lhs: ExplodeTreeId, rhs: ExplodeTreeId): number {
    let rtn = rhs.ids.length - lhs.ids.length;
    // First compare lengths for speed, then compare object names.
    if (rtn === 0)
      rtn = compareStrings(rhs.name, lhs.name);
    return rtn;
  }

  /** Produce the TileTree corresponding to the specified tree Id. The returned TileTree will be associated with its Id in a Map. */
  public async createTileTree(id: ExplodeTreeId, iModel: IModelConnection): Promise<ExplodeTileTree | undefined> {
    if (id.ids.length <= 0)
      return undefined;

    let info: TileVersionInfo;
    if (this._info === undefined)
      info = await IModelTileRpcInterface.getClient().queryVersionInfo();
    else
      info = this._info;

    const data = await ExplodeTreeSupplier.queryElements(iModel, id.ids);

    return new ExplodeTileTree({ data, iModel, tileVersionInfo: info, objectName: id.name });
  }

  /** Queries the backend for the elements to explode.  It also populates the data it can interpolate with a single pass. */
  private static async queryElements(iModel: IModelConnection, elementsIds: string[]): Promise<ElementData[]> {
    const query = `Select ECInstanceID,Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
    const results = iModel.query(query);
    const data: ElementData[] = [];
    let row = await results.next();
    while (row.value) {
      const element = (row.value as ElementDataProps);

      const placement = Placement3d.fromJSON({ origin: element.origin, angles: { pitch: element.pitch, roll: element.roll, yaw: element.yaw } });
      const transform = placement.transform;
      const box = Range3d.create(Point3d.fromJSON(element.bBoxLow), Point3d.fromJSON(element.bBoxHigh));

      data.push({ elementId: element.id, origin: Point3d.fromJSON(element.origin), boundingBox: transform.multiplyRange(box), transformWorld: transform });
      row = await results.next();
    }

    return data;
  }

  public getOwner(id: ExplodeTreeId, iModel: IModelConnection): TileTreeOwner {
    return iModel.tiles.getTileTreeOwner(id, this);
  }
}

/** References the unique TileTree for the currently exploded object. */
export class ExplodeTreeReference extends TileTreeReference {
  public static supplier = new ExplodeTreeSupplier();
  public id: ExplodeTreeId = { name: "", ids: [] };
  public explodeFactor: number = 0;

  public get treeOwner() {
    return this.iModel.tiles.getTileTreeOwner(this.id, ExplodeTreeReference.supplier);
  }

  /** Changes with TileTree this is referencing. */
  public setExplodeObject(name: string, ids: string[]) {
    this.id = { name, ids };
  }

  constructor(public iModel: IModelConnection) {
    super();
  }

  public get castsShadows() {
    return false;
  }

  /** Creates the arguments use for the draw call. */
  public createDrawArgs(context: SceneContext): ExplodeTileDrawArgs | undefined {
    const tree = this.treeOwner.load();
    if (undefined === tree)
      return undefined;

    return new ExplodeTileDrawArgs({
      context,
      tree,
      now: BeTimePoint.now(),
      location: this.computeTransform(tree),
      viewFlagOverrides: this.getViewFlagOverrides(tree),
      clipVolume: this.getClipVolume(tree),
      parentsAndChildrenExclusive: tree.parentsAndChildrenExclusive,
      symbologyOverrides: this.getSymbologyOverrides(tree),
      explodeFactor: this.explodeFactor,
    });
  }
}

/** The TileTree that will hold the tiles for a specific object being exploded. */
class ExplodeTileTree extends TileTree {
  private _centerOfMass: Point3d;
  private _elements: ElementTile[];

  public constructor(params: ExplodeTreeParams) {
    assert(params.data.length >= 0);
    super({
      id: `Explode_${params.objectName}_${params.data.length}`,
      modelId: params.iModel.iModelId!,
      iModel: params.iModel,
      priority: TileLoadPriority.Primary,
      location: Transform.createIdentity(),
    });

    // Create tiles for each element.
    this._centerOfMass = getRangeUnion(params.data.map((ele) => ele.boundingBox)).center;
    this._elements = [];
    for (const element of params.data) {
      const tileParams: TileParams = {
        centerOfMass: this._centerOfMass,
        versionInfo: params.tileVersionInfo,
        data: element,
      };
      this._elements.push(new ElementTile(this, tileParams));
    }

  }

  /** The lowest-resolution tile in this tree. */
  public get rootTile(): Tile {
    return this._elements[0]; // Not any lower-resolution, but will consistently exist.
  }
  /** True if this tile tree contains 3d graphics. */
  public get is3d(): boolean {
    return true;
  }
  /** Returns the maximum depth of this tree, if any. */
  public get maxDepth(): number | undefined {
    return 2; // Expected hierarchy: Element Tile -> Graphics Tile
  }
  /** The overrides that should be applied to the view's [ViewFlags]($common) when this tile tree is drawn. Can be overridden by individual [[TileTreeReference]]s. */
  public get viewFlagOverrides(): ViewFlagOverrides {
    return new ViewFlagOverrides();
  }
  /** True if this tile tree has no bounds - e.g., a tile tree representing a globe is unbounded. */
  public get isContentUnbounded(): boolean {
    return true;
  }

  /** This method to select tiles of appropriate resolution. */
  protected _selectTiles(args: TileDrawArgs): Tile[] {
    const tiles: Tile[] = [];
    for (const child of this._elements) {
      const tile = child.selectTile(args);
      if (tile)
        tiles.push(tile);
    }
    return tiles;
  }

  /** Produce graphics of appropriate resolution to be drawn in a [[Viewport]]. */
  public draw(args: TileDrawArgs): void {
    // TODO: Remove, this is for debugging.
    // const debug = args.context.viewport.debugBoundingBoxes;
    // args.context.viewport.debugBoundingBoxes = TileBoundingBoxes.Content;
    // console.debug("Draw Tree");
    assert(args instanceof ExplodeTileDrawArgs);

    // const builder = args.context.createSceneGraphicBuilder();
    // builder.addPointString([this._centerOfMass]);
    // args.graphics.add(builder.finish());

    const tiles = this.selectTiles(args);
    for (const tile of tiles)
      tile.drawGraphics(args);

    // args.context.viewport.debugBoundingBoxes = debug;
    args.drawGraphics();
  }

  public prune(): void { }

  public forcePrune(): void { }
}

/** This tile encompasses the all possible area of a specific element but contains no graphics itself. */
class ElementTile extends Tile {
  public formatVersion: number;
  public data: ElementData;
  public centerOfMass: Point3d;
  constructor(tree: TileTree, params: TileParams) {
    super({
      isLeaf: false,
      contentId: `${tree.id}_${params.data.elementId}`,
      range: ElementTile.calculatePossibleRange(params.data.boundingBox, params.centerOfMass),
      maximumSize: 512,
    }, tree);
    this.data = params.data;
    this.centerOfMass = params.centerOfMass;
    this.loadChildren();
    this.setIsReady();

    this.formatVersion = IModelApp.tileAdmin.getMaximumMajorTileFormatVersion(params.versionInfo.formatVersion);
  }

  /** Load this tile's children, possibly asynchronously. Pass them to `resolve`, or an error to `reject`. */
  protected _loadChildren(resolve: (children: Tile[] | undefined) => void, _reject: (error: Error) => void): void {
    // Invoked from constructor. We'll add child tiles later as needed.
    resolve([]);
  }

  /** This function will handle loading the tiles with the correct resolution. */
  public selectTile(args: TileDrawArgs): Tile | undefined {
    let rtn: Tile | undefined;
    assert(undefined !== this.children);
    if (this.isRegionCulled(args))
      return rtn;

    args.markUsed(this);

    // Compute the ideal chord tolerance.
    assert(this.maximumSize > 0);
    const pixelSize = args.getPixelSizeInMetersAtClosestPoint(this);
    assert(pixelSize > 0);

    // Round down to the nearest power of ten.
    const toleranceLog10 = Math.floor(Math.log10(pixelSize));

    // Find (or create) a child tile of desired tolerance. Also find a child tile that can be substituted for the desired tile if that tile's content is not yet loaded.
    // NB: Children are sorted in descending order by log10(tolerance)
    const children = this.children as ExplodedGraphicsTile[];
    let closestMatch: ExplodedGraphicsTile | undefined;
    let exactMatch: ExplodedGraphicsTile | undefined;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const tol = child.toleranceLog10;
      if (tol > toleranceLog10) {
        assert(undefined === exactMatch);
        if (child.hasGraphics)
          closestMatch = child;
      } else if (tol === toleranceLog10) {
        exactMatch = child;
      } else if (tol < toleranceLog10) {
        if (!exactMatch)
          children.splice(i++, 0, exactMatch = new ExplodedGraphicsTile(this, toleranceLog10));

        if (child.hasGraphics && (!closestMatch || closestMatch.toleranceLog10 > toleranceLog10))
          closestMatch = child;
      }
    }

    // If the exact tile wanted is not created, create it.
    if (!exactMatch) {
      assert(children.length === 0 || children[children.length - 1].toleranceLog10 > toleranceLog10);
      children.push(exactMatch = new ExplodedGraphicsTile(this, toleranceLog10));
    }

    if (!exactMatch.isReady) {
      args.insertMissing(exactMatch);
      if (closestMatch) {
        rtn = closestMatch;
        args.markUsed(closestMatch);
      }
    } else if (exactMatch.hasGraphics) {
      rtn = exactMatch;
      args.markUsed(exactMatch);
    }
    return rtn;
  }

  /** Joins the ranges of the transformed by the minium and maximum explode factor. */
  private static calculatePossibleRange(bBox: Range3d, centerOfMass: Point3d): Range3d {
    const maxRange = calculateExplodeTransform(bBox.center, centerOfMass, ExplodeApp.explodeAttributes.max).multiplyRange(bBox);
    const minRange = calculateExplodeTransform(bBox.center, centerOfMass, ExplodeApp.explodeAttributes.min).multiplyRange(bBox);
    maxRange.extendRange(minRange);
    return maxRange;
  }

  /** Tile has no content and should never request any. */
  public async requestContent(_isCanceled: () => boolean): Promise<TileRequest.Response> {
    assert(false, "Tile has no content");
    return undefined;
  }

  /** Tile has no content and should never have any to read. */
  public async readContent(_data: TileRequest.ResponseData, _system: RenderSystem, _isCanceled: () => boolean): Promise<TileContent> {
    throw new Error("Tile has no content");
  }

}

/** Produce a number iterating from 0 to the max integer. */
function* makeIdSequence() {
  let current = 0;
  while (true) {
    current %= Number.MAX_SAFE_INTEGER;
    yield ++current;
  }
}
const requestIdSequence = makeIdSequence();

/** These tiles actually handle loading and transforming the graphics for each tile at a specific tolerance. */
export class ExplodedGraphicsTile extends Tile {
  public get data(): ElementData { return this.parent.data; }
  public get centerOfMass(): Point3d { return this.parent.centerOfMass; }
  public get formatVersion(): number { return this.parent.formatVersion; }

  private _prevExplodeFactor: number = -1;
  private _explodeTransform = Transform.createIdentity();

  constructor(
    public readonly parent: ElementTile,
    public readonly toleranceLog10: number,
  ) {
    super({
      parent,
      isLeaf: true,
      contentId: `${parent.contentId}_${toleranceLog10}`,
      range: parent.range,
      maximumSize: parent.maximumSize,
    }, parent.tree);

    this.setExplodeTransform(ExplodeApp.explodeAttributes.min);
  }

  /** Creates an unique id for requesting tiles from the backend. */
  private makeRequestId(): string {
    const requestId = requestIdSequence.next();
    if (requestId.done)
      return (-1).toString(16);
    return requestId.value.toString(16);
  }

  /** No children tiles. */
  protected _loadChildren(resolve: (children: Tile[] | undefined) => void, _reject: (error: Error) => void): void {
    resolve(undefined);
  }

  /** Return a Promise that resolves to the raw data representing this tile's content. */
  public async requestContent(_isCanceled: () => boolean): Promise<TileRequest.Response> {
    const props: ElementGraphicsRequestProps = {
      id: this.makeRequestId(),
      elementId: this.data.elementId,
      toleranceLog10: this.toleranceLog10,
      formatVersion: this.formatVersion,
      clipToProjectExtents: false,
    };
    return IModelApp.tileAdmin.requestElementGraphics(this.tree.iModel, props);
  }

  /** Return a Promise that deserializes this tile's content from raw format produced by [[requestContent]]. */
  public async readContent(data: TileRequest.ResponseData, system: RenderSystem, isCanceled?: () => boolean): Promise<TileContent> {
    if (undefined === isCanceled)
      isCanceled = () => !this.isLoading;

    assert(data instanceof Uint8Array);
    const stream = new ByteStream(data.buffer);

    const position = stream.curPos;
    const format = stream.nextUint32;
    stream.curPos = position;

    assert(TileFormat.IModel === format);

    const tree = this.tree;
    const reader = ImdlReader.create(stream, tree.iModel, tree.modelId, tree.is3d, system, undefined, undefined, isCanceled, undefined, this.contentId);

    let content: TileContent = { isLeaf: true };
    if (reader) {
      try {
        content = await reader.read();
      } catch (_) {
        //
      }
    }
    return content;
  }

  /** Updates the content range and transform applied to the graphics with a changed explode factor. */
  public setExplodeTransform(explodeFactor: number) {
    if (explodeFactor === this._prevExplodeFactor) return;
    this._explodeTransform = calculateExplodeTransform(this.data.boundingBox.center, this.centerOfMass, explodeFactor);
    this._contentRange = this._explodeTransform.multiplyRange(this.data.boundingBox);
  }

  /** Output this tile's graphics. */
  public drawGraphics(args: ExplodeTileDrawArgs) {
    const gfx = this.produceGraphics();
    if (!gfx) return;
    this.setExplodeTransform(args.explodeFactor);

    // Create a new graphics branch we can effect which making change to the rest of the model.
    const branch = new GraphicBranch();
    branch.add(gfx);

    // overrides the preexisting graphics that are being replaced.
    const overrides = new FeatureSymbology.Overrides(args.context.viewport);
    // TODO: Hide emphasized elements.
    const app = FeatureAppearance.fromTransparency(0); // Fully transparent
    overrides.overrideElement(this.data.elementId, app, true);
    branch.symbologyOverrides = overrides;

    // Creates a new set of graphics transformed by the matrix create by the updated explode factor.
    args.graphics.add(args.context.createGraphicBranch(branch, this._explodeTransform, {}));

    // Line is required for the debugging tile ranges feature.  Very useful for debugging, but unused by the actual sample.
    const rangeGfx = this.getRangeGraphic(args.context);
    if (undefined !== rangeGfx)
      args.graphics.add(rangeGfx);
  }
}
