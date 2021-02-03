/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert, BeTimePoint, ByteStream, compareStrings, SortedArray } from "@bentley/bentleyjs-core";
import { Point3d, Range3d, Transform, Vector3d, XYZProps } from "@bentley/geometry-core";
import { BatchType, ElementGraphicsRequestProps, FeatureAppearance, IModelTileRpcInterface, Placement3d, TileFormat, TileVersionInfo, ViewFlagOverrides } from "@bentley/imodeljs-common";
import { CoordSystem, FeatureSymbology, GraphicBranch, ImdlReader, IModelApp, IModelConnection, IModelTileTree, RenderSystem, Tile, TileContent, TileDrawArgs, TileLoadPriority, TileRequest, Tiles, TileTree, TileTreeOwner, TileTreeParams, TileTreeReference, Viewport, TileTreeSupplier, TileTreeSet, TileDrawArgParams, SceneContext, DecorateContext, GraphicType } from "@bentley/imodeljs-frontend";

interface ElementData {
  elementId: string;
  origin: Point3d;

  boundingBox: Range3d;
  transformWorld: Transform;
}

interface ElementDataProps {
  id: string;
  origin: XYZProps;
  bBoxHigh: XYZProps;
  bBoxLow: XYZProps;
  pitch: number;
  roll: number;
  yaw: number;
}

// interface ExplodeTileParams {
//   elementId: string;
//   boundingBox: Range3d;
//   transformWorld: Transform;
//   formatVersion: number;
// }

export interface ExplodeTreeId {
  name: string;
  ids: string[];
}

interface ExplodeTreeParams {
  data: ElementData[];
  iModel: IModelConnection;
  tileVersionInfo: TileVersionInfo;
}

interface ExplodeTileDrawArgsParams extends TileDrawArgParams {
  explodeFactor: number;
  centerOfMass: Point3d;
}

class ExplodeTileDrawArgs extends TileDrawArgs {
  public explodeFactor: number;
  public centerOfMass: Point3d;
  constructor(params: ExplodeTileDrawArgsParams) {
    super(params);
    this.explodeFactor = params.explodeFactor;
    this.centerOfMass = params.centerOfMass;
  }
}

/** Creates a Range3d containing all the points using the Range3d API. */
function getRangeUnion(ranges: Range3d[]): Range3d {
  const range = Range3d.createNull();
  for (const r of ranges)
    range.extendRange(r);
  return range;
}

class ExplodeTreeSupplier implements TileTreeSupplier {
  public ids: string[] = [];
  private _info: TileVersionInfo | undefined;

  /** Compare two tree Ids returning a negative number if lhs < rhs, a positive number if lhs > rhs, or 0 if the Ids are equivalent. */
  public compareTileTreeIds(lhs: ExplodeTreeId, rhs: ExplodeTreeId): number {
    let rtn = rhs.ids.length - lhs.ids.length;
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

    console.debug("TileTreeCreation", id.name);
    return new ExplodeTileTree({ data, iModel, tileVersionInfo: info });
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

      data.push({ elementId: element.id, origin: Point3d.fromJSON(element.origin), boundingBox: box, transformWorld: transform });
      row = await results.next();
    }

    return data;
  }

  public getOwner(id: ExplodeTreeId, iModel: IModelConnection): TileTreeOwner {
    return iModel.tiles.getTileTreeOwner(id, this);
  }
}

export class ExplodeTreeReference extends TileTreeReference {
  public static supplier = new ExplodeTreeSupplier();
  public id: ExplodeTreeId = { name: "", ids: [] };
  public explodeFactor: number = 0;
  public get treeOwner() {
    return this.iModel.tiles.getTileTreeOwner(this.id, ExplodeTreeReference.supplier);
  }

  public setExplodeObject(name: string, ids: string[]) {
    this.id = { name, ids };
  }

  constructor(public iModel: IModelConnection) {
    super();
  }

  public get castsShadows() {
    return false;
  }

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
      centerOfMass: Point3d.createZero(), // Will Update in the TileTree with the actual center of mass
    });
  }
}

class ExplodeTileTree extends TileTree {
  private _centerOfMass: Point3d;
  private _elements: ElementTile[];
  public constructor(params: ExplodeTreeParams) {
    assert(params.data.length >= 0);
    super({
      id: `Explode_${params.data.length}`,
      modelId: params.iModel.iModelId!,
      iModel: params.iModel,
      priority: TileLoadPriority.Primary,
      location: Transform.createIdentity(),
    });

    console.debug("TileTree");
    // Create tiles
    this._elements = [];
    for (const element of params.data) {
      this._elements.push(new ElementTile(this, element, params.tileVersionInfo));
    }

    this._centerOfMass = getRangeUnion(params.data.map((ele) => ele.boundingBox)).center;
  }

  /** The lowest-resolution tile in this tree. */
  public get rootTile(): Tile {
    return this._elements[0];
  }
  /** True if this tile tree contains 3d graphics. */
  public get is3d(): boolean {
    return true;
  }
  /** Returns the maximum depth of this tree, if any. */
  public get maxDepth(): number | undefined {
    return 2;
  }
  /** The overrides that should be applied to the view's [ViewFlags]($common) when this tile tree is drawn. Can be overridden by individual [[TileTreeReference]]s. */
  public get viewFlagOverrides(): ViewFlagOverrides {
    return new ViewFlagOverrides();
  }
  /** True if this tile tree has no bounds - e.g., a tile tree representing a globe is unbounded. */
  public get isContentUnbounded(): boolean {
    return true;
  }

  /** Implement this method to select tiles of appropriate resolution. */
  protected _selectTiles(args: TileDrawArgs): Tile[] {
    console.debug("Selection, Start");
    const tiles: Tile[] = [];
    for (const child of this._elements) {
      const tile = child.selectTile(args);
      if (tile)
        tiles.push(tile);
    }
    console.debug("Tiles Selected", tiles);
    return tiles;
  }

  /** Produce graphics of appropriate resolution to be drawn in a [[Viewport]]. */
  public draw(args: TileDrawArgs): void {
    console.debug("Draw Tree");
    assert(args instanceof ExplodeTileDrawArgs);

    args.centerOfMass = this._centerOfMass;
    const tiles = this.selectTiles(args);
    for (const tile of tiles)
      tile.drawGraphics(args);
  }

  /** Discard tiles and/or tile contents, presumably based on a least-recently-used and/or least-likely-to-be-needed criterion. */
  public prune(): void { }

  /** This function will forcibly prune any unused tiles associated with the tree, ignoring any expiration times.
   * An unused tile is a tile that is not currently in use by any viewport.
   * @alpha
   */
  public forcePrune(): void { }
}

class ElementTile extends Tile {
  public formatVersion: number;
  constructor(tree: TileTree, public data: ElementData, tileVersion: TileVersionInfo) {
    super({
      isLeaf: false,
      contentId: `${tree.id}_${data.elementId}`,
      range: data.boundingBox,
      maximumSize: 512,
    }, tree);
    this.loadChildren();
    this.setIsReady();

    console.debug("Tile", data.elementId);
    this.formatVersion = IModelApp.tileAdmin.getMaximumMajorTileFormatVersion(tileVersion.formatVersion);
  }

  protected _loadChildren(resolve: (children: Tile[] | undefined) => void, _reject: (error: Error) => void): void {
    // Invoked from constructor. We'll add child tiles later as needed.
    resolve([]);
  }

  public selectTile(args: TileDrawArgs): Tile | undefined {
    let rtn: Tile | undefined;
    assert(undefined !== this.children);
    // if (this.isRegionCulled(args))
    //   return rtn;

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
          children.splice(i++, 0, exactMatch = new ExplodedGraphicsTile(this, this.formatVersion, toleranceLog10));

        if (child.hasGraphics && (!closestMatch || closestMatch.toleranceLog10 > toleranceLog10))
          closestMatch = child;
      }
    }

    if (!exactMatch) {
      assert(children.length === 0 || children[children.length - 1].toleranceLog10 > toleranceLog10);
      children.push(exactMatch = new ExplodedGraphicsTile(this, this.formatVersion, toleranceLog10));
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

  public calculateExplodeTransform(centerOfMass: Point3d, centerOfElement: Point3d, explodeFactor: number) {
    const vector = Vector3d.createFrom(centerOfMass);
    vector.subtractInPlace(centerOfElement);
    vector.scaleInPlace(explodeFactor);
    return Transform.createTranslation(vector);
  }

  public async requestContent(_isCanceled: () => boolean): Promise<TileRequest.Response> {
    assert(false, "Root dynamic tile has no content");
    return undefined;
  }

  public async readContent(_data: TileRequest.ResponseData, _system: RenderSystem, _isCanceled: () => boolean): Promise<TileContent> {
    throw new Error("Root dynamic tile has no content");
  }

}

function* makeIdSequence() {
  let current = 0;
  while (true) {
    current %= Number.MAX_SAFE_INTEGER;
    yield ++current;
  }
}
const requestIdSequence = makeIdSequence();

export class ExplodedGraphicsTile extends Tile {
  private _prevExplodeFactor: number = -1;
  private _explodeTransform = Transform.createIdentity();
  constructor(public readonly parent: ElementTile, public formatVersion: number, public toleranceLog10: number) {
    super({
      parent,
      isLeaf: true,
      contentId: `${parent.contentId}_${toleranceLog10}`,
      range: parent.data.boundingBox,
      maximumSize: parent.maximumSize,
    }, parent.tree);
    console.debug(this.contentId);
  }

  /** Creates an unique id for requesting tiles from the backend. */
  private makeRequestId(): string {
    const requestId = requestIdSequence.next();
    if (requestId.done)
      return (-1).toString(16);
    return requestId.value.toString(16);
  }

  /** Load this tile's children, possibly asynchronously. Pass them to `resolve`, or an error to `reject`. */
  protected _loadChildren(resolve: (children: Tile[] | undefined) => void, _reject: (error: Error) => void): void {
    resolve([]);
  }

  /** Return a Promise that resolves to the raw data representing this tile's content. */
  public async requestContent(_isCanceled: () => boolean): Promise<TileRequest.Response> {
    const props: ElementGraphicsRequestProps = {
      id: this.makeRequestId(),
      elementId: this.parent.data.elementId,
      toleranceLog10: this.toleranceLog10,
      formatVersion: this.formatVersion,
      // location: element.transformExplode.toJSON(),
      // contentFlags: idProvider.contentFlags,
      // omitEdges: !this.tree.hasEdges,
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

    // ###TODO: IModelGraphics format wraps IModel format.
    assert(TileFormat.IModel === format);

    const tree = this.tree;
    // assert(tree instanceof IModelTileTree);
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

  public setExplodeTransform(centerOfMass: Point3d, explodeFactor: number) {
    if (explodeFactor === this._prevExplodeFactor) return;
    const vector = Vector3d.createFrom(centerOfMass);
    vector.subtractInPlace(this.parent.data.boundingBox.center);
    vector.scaleInPlace(explodeFactor);
    this._explodeTransform = Transform.createTranslation(vector);
  }

  /** Output this tile's graphics. */
  public drawGraphics(args: ExplodeTileDrawArgs) {
    const gfx = this.produceGraphics();
    if (!gfx) return;
    const branch = new GraphicBranch();
    const overrides = new FeatureSymbology.Overrides(args.context.viewport);
    const app = FeatureAppearance.fromTransparency(0);
    overrides.overrideElement(this.parent.data.elementId, app, true);
    branch.add(gfx);
    branch.symbologyOverrides = overrides;

    this.setExplodeTransform(args.centerOfMass, args.explodeFactor);

    args.context.outputGraphic(args.context.createGraphicBranch(branch, this._explodeTransform.inverse()!, {}));
  }
}
