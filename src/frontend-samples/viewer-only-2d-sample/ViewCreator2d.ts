/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Id64Array, Id64String } from "@bentley/bentleyjs-core";
import { Range3d } from "@bentley/geometry-core";
import { Code, ColorDef, IModel, ModelProps, SheetProps, ViewDefinition2dProps, ViewStateProps } from "@bentley/imodeljs-common";
import { DrawingModelState, DrawingViewState, IModelConnection, SectionDrawingModelState, SheetModelState, SheetViewState, ViewState, ViewState2d } from "@bentley/imodeljs-frontend";

/** API for creating a 2D view from a model */
export class ViewCreator2d {

  constructor(private _imodel: IModelConnection) { }

  public static drawingModelClasses = [DrawingModelState.classFullName, SectionDrawingModelState.classFullName];
  public static sheetModelClasses = [SheetModelState.classFullName];

  public static isDrawingModelClass(modelType: string) {
    if (ViewCreator2d.drawingModelClasses.includes(modelType)) {
      return true;
    }
    return false;
  }

  public static isSheetModelClass(modelType: string) {
    if (ViewCreator2d.sheetModelClasses.includes(modelType)) {
      return true;
    }
    return false;
  }

  /** Create and return a view for a given 2D model */
  public async getViewForModel(model: ModelProps, vpAspect?: number): Promise<ViewState | undefined> {
    let viewState: ViewState2d | undefined;

    if (model.id) viewState = await this._createViewState2d(model.id, model.classFullName, vpAspect);
    if (viewState) await viewState.load();

    return viewState;
  }

  /** Create view from any 2D model type (Drawing/SectionDrawring/Sheet) */
  private async _createViewState2d(modelId: Id64String, modelType: string, vpAspect?: number): Promise<ViewState2d | undefined> {
    let viewState: ViewState2d | undefined;

    if (ViewCreator2d.isDrawingModelClass(modelType)) {
      const props = await this._createViewStateProps(modelId, ColorDef.white, vpAspect);
      viewState = (DrawingViewState.createFromProps(props, this._imodel) as ViewState2d);
    } else if (ViewCreator2d.isSheetModelClass(modelType)) {
      let props = await this._createViewStateProps(modelId, ColorDef.white, vpAspect);
      props = await this._addSheetViewProps(modelId, props);
      viewState = (SheetViewState.createFromProps(props, this._imodel) as ViewState2d);
    }

    return viewState;
  }

  /** Create ViewStateProps for the model. ViewStateProps are composed of the 4 sets of Props below */
  private _createViewStateProps = async (modelId: Id64String, bgColor: ColorDef, vpAspect?: number): Promise<ViewStateProps> => {
    // Use dictionary model in all props
    const dictionaryId = IModel.dictionaryId;
    const categories = await this._getAllCategories();

    // model extents
    const modelProps = await this._imodel.models.queryModelRanges(modelId);
    const modelExtents = Range3d.fromJSON(modelProps[0]);
    let originX = modelExtents.low.x;
    let originY = modelExtents.low.y;
    let deltaX = modelExtents.xLength();
    let deltaY = modelExtents.yLength();

    // if vp aspect given, update model extents to fit view
    if (vpAspect) {
      const modelAspect = deltaY / deltaX;

      if (modelAspect > vpAspect) {
        const xFix = deltaY / vpAspect;
        originX = originX - xFix / 2;
        deltaX = deltaX + xFix;
      } else if (modelAspect < vpAspect) {
        const yFix = deltaX * vpAspect;
        originY = originY - yFix / 2;
        deltaY = deltaY + yFix;
      }
    }

    const modelSelectorProps = {
      models: [modelId],
      code: Code.createEmpty(),
      model: dictionaryId,
      classFullName: "BisCore:ModelSelector",
    };

    const categorySelectorProps = {
      categories,
      code: Code.createEmpty(),
      model: dictionaryId,
      classFullName: "BisCore:CategorySelector",
    };

    const viewDefinitionProps: ViewDefinition2dProps = {
      baseModelId: modelId,
      categorySelectorId: "",
      displayStyleId: "",
      origin: { x: originX, y: originY },
      delta: { x: deltaX, y: deltaY },
      angle: { radians: 0 },
      code: Code.createEmpty(),
      model: dictionaryId,
      classFullName: "BisCore:ViewDefinition2d",
    };

    const displayStyleProps = {
      code: Code.createEmpty(),
      model: dictionaryId,
      classFullName: "BisCore:DisplayStyle",
      jsonProperties: {
        styles: {
          backgroundColor: bgColor.toJSON(),
        },
      },
    };

    return {
      displayStyleProps,
      modelSelectorProps,
      categorySelectorProps,
      viewDefinitionProps,
      modelExtents,
    };
  }

  private async _addSheetViewProps(modelId: Id64String, props: ViewStateProps) {
    let width = 0;
    let height = 0;
    for await (const row of this._imodel.query(`SELECT Width, Height FROM bis.Sheet WHERE ECInstanceId = ${modelId}`)) {
      width = row.width as number;
      height = row.height as number;
      break;
    }
    const sheetProps: SheetProps = {
      model: modelId,
      code: { spec: "", scope: "" },
      classFullName: "DrawingSheetModel",
      height,
      width,
    };

    props.sheetAttachments = await this._getSheetAttachments(modelId);
    props.sheetProps = sheetProps;

    return props;
  }

  private async _getAllCategories(): Promise<Id64Array> {
    // Only use categories with elements in them
    const allDrawingCategories = "SELECT ECInstanceId from BisCore.DrawingCategory";
    const categories = await this._executeQuery(allDrawingCategories);

    return categories;
  }

  private async _getSheetAttachments(modelId: string): Promise<string[]> {
    // Only use categories with elements in them
    const attachmentQuery = `SELECT ECInstanceId FROM Bis.ViewAttachment WHERE Model.Id = ${modelId}`;
    const attachments = await this._executeQuery(attachmentQuery);

    return attachments;
  }

  private _executeQuery = async (query: string) => {
    const rows = [];
    for await (const row of this._imodel.query(query))
      rows.push(row.id);

    return rows;
  }
}
