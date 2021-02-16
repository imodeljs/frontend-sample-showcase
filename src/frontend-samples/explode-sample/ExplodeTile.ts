/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert, BeEvent, BeTimePoint, ByteStream, compareStrings, Id64, partitionArray } from "@bentley/bentleyjs-core";
import { Point3d, Range3d, Transform, Vector3d, XYZProps } from "@bentley/geometry-core";
import { BatchType, ElementGraphicsRequestProps, FeatureAppearance, FeatureAppearanceProvider, FeatureAppearanceSource, GeometryClass, IModelTileRpcInterface, Placement3d, TileFormat, TileVersionInfo, ViewFlagOverrides } from "@bentley/imodeljs-common";
import { GraphicBranch, ImdlReader, IModelApp, IModelConnection, RenderSystem, SceneContext, Tile, TileContent, TileDrawArgParams, TileDrawArgs, TileLoadPriority, TileRequest, TileTree, TileTreeOwner, TileTreeReference, TileTreeSupplier, Viewport } from "@bentley/imodeljs-frontend";
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

/** Creates a transform matrix translating the range away from the point scaled. */
function calculateExplodeTransform(centerOfElement: Point3d, displaceOrigin: Point3d, explodeScaling: number) {
  const vector = Vector3d.createFrom(displaceOrigin);
  vector.subtractInPlace(centerOfElement);
  vector.scaleInPlace(explodeScaling - 1);
  // The inverse method will never return undefined as the transform is only a translation and is always invertible.
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

    let info: Promise<TileVersionInfo>;
    if (this._info === undefined)
      info = IModelTileRpcInterface.getClient().queryVersionInfo();
    else
      info = Promise.resolve(this._info);

    const data = await ExplodeTreeSupplier.queryElements(iModel, id.ids);

    return new ExplodeTileTree({ data, iModel, tileVersionInfo: await info, objectName: id.name });
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

/** Holds the data to report to the App about the tile tree state. */
interface TreeData {
  range: Range3d;
  elementContentLoaded: string[];
}
export type TreeDataListener = (name: string, didRangeUpdate: boolean, didElementIdsUpdate: boolean) => void;

/** References the unique TileTree for the currently exploded object. */
export class ExplodeTreeReference extends TileTreeReference {
  // These methods facilitate communication from the TileTree to the App and Provider.
  private static treeDataMap = new Map<string, TreeData>();
  /** Event is raised when any TileTree reports a new range or tile loaded. */
  public static onTreeDataUpdated = new BeEvent<TreeDataListener>();

  /** Updates the range related to the tile tree that handles that object. */
  public static setTreeRange(treeName: string, range: Range3d) {
    const oldData = this.getOrCreateTreeDataMap(treeName);
    range.clone(oldData.range);
    this.onTreeDataUpdated.raiseEvent(treeName, true, false);
  }
  /** Adds an element id to the list of loaded element graphics related to the tile tree that handles that object. */
  public static setTreeLoadedId(treeName: string, id: string) {
    const oldData = this.getOrCreateTreeDataMap(treeName);
    oldData.elementContentLoaded.push(id);
    this.onTreeDataUpdated.raiseEvent(treeName, false, true);
  }
  /** Returns the data related to the tile tree for that object. */
  private static getOrCreateTreeDataMap(name: string): TreeData {
    if (!this.treeDataMap.has(name))
      this.treeDataMap.set(name, { range: Range3d.createNull(), elementContentLoaded: [] });
    return this.treeDataMap.get(name)!;
  }
  /** Returns a set of ElementIDs that the tile tree has graphics loaded. */
  public static getTreeReadyIds(name: string): Set<string> {
    const array = this.getOrCreateTreeDataMap(name).elementContentLoaded;
    return new Set<string>(array);
  }
  /** Returns the range of the tile tree, if it's been calculated yet, otherwise returns undefined. */
  public static getTreeRange(name: string): Range3d | undefined {
    const range = this.getOrCreateTreeDataMap(name).range;
    return Range3d.isNull(range) ? undefined : range.clone();
  }

  // These methods support the functionality of the TileTreeReference itself.
  public static supplier = new ExplodeTreeSupplier();
  /** Uniquely identifies which TileTree this is referencing. */
  public id: ExplodeTreeId = { name: "", ids: [] };
  public explodeScaling: number = 1;

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

  /** Creates the arguments use for the draw call. Overridden to inject the explode scaling as an argument. */
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
      explodeFactor: this.explodeScaling,
    });
  }
}

/** The TileTree that will hold the tiles for a specific object being exploded. */
class ExplodeTileTree extends TileTree {
  private _rootTile: RootTile;

  public readonly elementContentLoaded: (elementId: string) => void;
  public constructor(params: ExplodeTreeParams) {
    assert(params.data.length >= 0);
    super({
      id: `Explode_${params.objectName}_${params.data.length}`,
      modelId: params.iModel.iModelId!,
      iModel: params.iModel,
      priority: TileLoadPriority.Primary,
      location: Transform.createIdentity(),
    });
    this._rootTile = new RootTile(this, params.data, params.tileVersionInfo);

    // Ensures that graphics are not cut off by going outside the iModel extents.
    this.iModel.expandDisplayedExtents(this.range);
    // Will communicate the range back to the app for the zoom to volume.
    ExplodeTreeReference.setTreeRange(params.objectName, this.range);
    this.elementContentLoaded = (elementId: string) => {
      // Will communicate the range back to the app for the zoom to volume.
      ExplodeTreeReference.setTreeLoadedId(params.objectName, elementId);
    };
  }

  /** The lowest-resolution tile in this tree. */
  public get rootTile(): Tile {
    return this._rootTile;
  }
  /** True if this tile tree contains 3d graphics. */
  public get is3d(): boolean {
    return true;
  }
  /** Returns the maximum depth of this tree, if any. */
  public get maxDepth(): number | undefined {
    return 3; // Expected hierarchy: RootTile -> Element Tile -> Graphics Tile
  }
  /** The overrides that should be applied to the view's [ViewFlags]($common) when this tile tree is drawn. Can be overridden by individual [[TileTreeReference]]s. */
  public get viewFlagOverrides(): ViewFlagOverrides {
    return new ViewFlagOverrides();
  }
  /** True if this tile tree has no bounds - e.g., a tile tree representing a globe is unbounded. */
  public get isContentUnbounded(): boolean {
    return false;
  }

  /** This method to select tiles of appropriate resolution. */
  protected _selectTiles(args: TileDrawArgs): Tile[] {
    return this._rootTile.selectTiles(args);
  }

  /** Produce graphics of appropriate resolution to be drawn in a [[Viewport]]. */
  public draw(args: TileDrawArgs): void {
    assert(args instanceof ExplodeTileDrawArgs);

    const tiles = this.selectTiles(args);
    for (const tile of tiles)
      tile.drawGraphics(args);

    // Unused by this sample but helpful for debugging the tiles.
    const rangeGfx = this.rootTile.getRangeGraphic(args.context);
    if (undefined !== rangeGfx)
      args.graphics.add(rangeGfx);

    args.drawGraphics();
  }

  public prune(): void {
    const olderThan = BeTimePoint.now().minus(this.expirationTime);
    this._rootTile.prune(olderThan);
  }

  public forcePrune(): void { }
}

/** This tile acts as an entry point for the tile hierarchy it's range encompasses the range of all children tiles. */
class RootTile extends Tile implements FeatureAppearanceProvider {
  private readonly _versionInfo: TileVersionInfo;
  private readonly _data: ElementData[];
  private readonly _centerOfMass: Point3d;

  private get _elementTiles(): ElementTile[] { return this.children as ElementTile[]; }
  public get appearanceProvider(): FeatureAppearanceProvider {
    return this;
  }

  public constructor(tree: ExplodeTileTree, data: ElementData[], versionInfo: TileVersionInfo) {
    const range = getRangeUnion(data.map((ele) => ele.boundingBox));
    super({
      isLeaf: false,
      contentId: `${tree.id}_Root`,
      range,
      maximumSize: 512,
    }, tree);

    // This data is needed to generating the element tiles.
    this._centerOfMass = this.range.center.clone();
    this._versionInfo = versionInfo;
    this._data = data;

    this.loadChildren();
    assert(undefined !== this.children);

    this.setIsReady();
  }

  /** Returns graphics representing the exploded elements. */
  public selectTiles(args: TileDrawArgs): Tile[] {
    const selected: Tile[] = [];
    for (const child of this._elementTiles) {
      const graphicsTile = child.selectTile(args);
      if (graphicsTile)
        selected.push(graphicsTile);
    }
    return selected;
  }

  /** Required by FeatureAppearanceProvider. Returns a FeatureAppearance based on element id and other factors or undefined if the it's not to be rendered. */
  public getFeatureAppearance(source: FeatureAppearanceSource, elemLo: number, elemHi: number, subcatLo: number, subcatHi: number, geomClass: GeometryClass, modelLo: number, modelHi: number, type: BatchType, animationNodeId: number): FeatureAppearance | undefined {
    const alwaysDrawIds = new Id64.Uint32Set(this._elementTiles.map((element) => element.data.elementId));
    // If the ids is one of the elements in the tree, always draw it.
    if (alwaysDrawIds.has(elemLo, elemHi))
      return FeatureAppearance.fromJSON({});

    // The source will return undefined for our elements as they have the same Ids that have been mark to never draw by the FeatureOverrideProvider in the App.
    return source.getAppearance(elemLo, elemHi, subcatLo, subcatHi, geomClass, modelLo, modelHi, type, animationNodeId);
  }

  public prune(olderThan: BeTimePoint) {
    // Never discard ElementTiles - do discard not-recently-used graphics.
    if (this.children)
      for (const child of this.children)
        (child as ElementTile).pruneChildren(olderThan);
  }

  /** This will generate the ElementTiles that will replace and modify each element in the exploded view. */
  protected _loadChildren(resolve: (children: Tile[] | undefined) => void, _reject: (error: Error) => void): void {
    const elements: ElementTile[] = [];
    for (const element of this._data) {
      const tileParams: TileParams = {
        centerOfMass: this._centerOfMass,
        versionInfo: this._versionInfo,
        data: element,
      };
      const tile = new ElementTile(this, tileParams);
      elements.push(tile);
      // The range of a child element must be included in it's parent.
      this.range.extendRange(tile.range);
    }
    resolve(elements);
  }

  public async requestContent(_isCanceled: () => boolean): Promise<TileRequest.Response> {
    assert(false, "Root tile has no content");
    return undefined;
  }

  public async readContent(_data: TileRequest.ResponseData, _system: RenderSystem, _isCanceled: () => boolean): Promise<TileContent> {
    throw new Error("Root tile has no content");
  }
}

/** This tile encompasses the all possible area of a specific element but contains no graphics itself. */
class ElementTile extends Tile {
  public formatVersion: number;
  public data: ElementData;
  public centerOfMass: Point3d;
  constructor(parent: Tile, params: TileParams) {
    super({
      parent,
      isLeaf: false,
      contentId: `${parent.contentId}_${params.data.elementId}`,
      range: ElementTile.calculatePossibleRange(params.data.boundingBox, params.centerOfMass),
      maximumSize: parent.maximumSize,
    }, parent.tree);
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

  /** Joins the ranges of the transformed by the minium and maximum explode scaling. */
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

  public pruneChildren(olderThan: BeTimePoint): void {
    const children = this.children as ExplodedGraphicsTile[];
    assert(undefined !== children);

    const partitionIndex = partitionArray(children, (child) => !child.usageMarker.isExpired(olderThan));

    // Remove expired children.
    if (partitionIndex < children.length) {
      const expired = children.splice(partitionIndex);
      for (const child of expired)
        child.dispose();
    }

    // Restore ordering.
    children.sort((x, y) => y.toleranceLog10 - x.toleranceLog10);
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
  public get rootTile(): RootTile { return this.parent.parent as RootTile; }
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

  public computeLoadPriority(_viewports: Iterable<Viewport>): number {
    // We want the element's graphics to be updated as soon as possible
    return 0;
  }

  /** Creates an unique id for requesting tiles from the backend. */
  private makeRequestId(): string {
    const requestId = requestIdSequence.next();
    assert(!requestId.done);
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

    (this.tree as ExplodeTileTree).elementContentLoaded(this.data.elementId);
    return content;
  }

  /** Updates the content range and transform applied to the graphics with a changed explode scaling. */
  public setExplodeTransform(explodeScaling: number) {
    if (explodeScaling === this._prevExplodeFactor) return;
    this._explodeTransform = calculateExplodeTransform(this.data.boundingBox.center, this.centerOfMass, explodeScaling);
    this._explodeTransform.multiplyRange(this.data.boundingBox, this._contentRange);
  }

  /** Output this tile's graphics. */
  public drawGraphics(args: ExplodeTileDrawArgs) {
    const gfx = this.produceGraphics();
    if (!gfx) return;
    this.setExplodeTransform(args.explodeFactor);

    // Create a new graphics branch we can effect which making change to the rest of the model.
    const branch = new GraphicBranch();
    branch.add(gfx);

    // Creates a new set of graphics transformed by the matrix create by the updated explode scaling.  The appearanceProvider ensures the elements are drawn;
    args.graphics.add(args.context.createGraphicBranch(branch, this._explodeTransform, { appearanceProvider: this.rootTile.appearanceProvider }));

    // Line is required for the debugging tile ranges feature.  Very useful for debugging, but unused by the sample.
    const rangeGfx = this.getRangeGraphic(args.context);
    if (undefined !== rangeGfx)
      args.graphics.add(rangeGfx);
  }

  public onActiveRequestCanceled(): void {
    IModelApp.tileAdmin.cancelElementGraphicsRequest(this);
  }
}
