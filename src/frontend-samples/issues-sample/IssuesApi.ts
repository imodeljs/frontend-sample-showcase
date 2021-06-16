/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { AuthorizedFrontendRequestContext,IModelApp } from "@bentley/imodeljs-frontend";
import { MarkerData, MarkerPinDecorator } from "../marker-pin-sample/MarkerPinDecorator";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BeEvent } from "@bentley/bentleyjs-core";
import { Point3d } from "@bentley/geometry-core";
import { IssuesClient } from "./IssuesClient";

export default class IssuesApi {

  public static onClashDataChanged = new BeEvent<any>();
  public static _issuesPinDecorator?: MarkerPinDecorator;
  public static readonly issue_marker: string = `
    <svg viewBox="0 0 32 32" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="m25 0h-18a5 5 0 0 0 -5 5v18a5 5 0 0 0 5 5h5v.00177l4 3.99823 4-3.99823v-.00177h5a5 5 0 0 0 5-5v-18a5 5 0 0 0 -5-5z" fill="#fff" fill-rule="evenodd"/>
      <path id="fill" d="m25 1a4.00453 4.00453 0 0 1 4 4v18a4.00453 4.00453 0 0 1 -4 4h-18a4.00453 4.00453 0 0 1 -4-4v-18a4.00453 4.00453 0 0 1 4-4z" fill="#008be1"/>
      <path id="icon" d="m10.8125 5h1.125v18h-1.125zm12.375 6.75h-10.125v-6.75h10.125l-4.5 3.375z" fill="#fff"/>
    </svg>`;

  private static readonly _issueClient = new IssuesClient();

  private static _requestContext: AuthorizedClientRequestContext;

  private static async getRequestContext() {
    if (!IssuesApi._requestContext) {
      IssuesApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return IssuesApi._requestContext;
  }

  public static async getProjectIssues(projectId: string) {
    const context = await IssuesApi.getRequestContext();
    return IssuesApis.getProjectIssues(context, projectId);
  }

  public static async getIssueDetails(issueId: string) {
    const context = await IssuesApi.getRequestContext();
    return IssuesApis.getIssueDetails(context, issueId);
  }

  public static async getIssueAttachments(issueId: string) {
    const context = await IssuesApi.getRequestContext();
    return IssuesApis.getIssueAttachments(context, issueId);
  }

  public static async getAttachmentById(issueId: string, attachmentId: string) {
    const context = await IssuesApi.getRequestContext();
    return IssuesApis.getAttachmentById(context, issueId, attachmentId);
  }

  public static decoratorIsSetup() {
    return (null != this._issuesPinDecorator);
  }

  public static setupDecorator() {
    if(undefined === this._issuesPinDecorator)
      this._issuesPinDecorator = new MarkerPinDecorator();
  }

  public static addDecoratorPoint(point: Point3d, pinImage: HTMLImageElement) {
    if (this._issuesPinDecorator)
      this._issuesPinDecorator.addPoint(point, pinImage)
  }

  public static enableDecorations() {
    if (this._issuesPinDecorator)
      IModelApp.viewManager.addDecorator(this._issuesPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._issuesPinDecorator)
      IModelApp.viewManager.dropDecorator(this._issuesPinDecorator);
  }

  /**
   * Helper to determine text color on the basis of background hex color.
   * @param markerFillColor hex color value of marker fill color
   * @note normal color parsing is not implemented so make sure to pass hex color value.
   * @see https://24ways.org/2010/calculating-color-contrast
   */
  public static buildForegroundColor = (markerFillColor: string): string | undefined => {
    if (!markerFillColor) return;
    if (markerFillColor[0] === "#") {
      markerFillColor = markerFillColor.slice(1);
    }
    const r = parseInt(markerFillColor.substr(0, 2), 16);
    const g = parseInt(markerFillColor.substr(2, 2), 16);
    const b = parseInt(markerFillColor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    // All focus on yellow only, when user will start picking their own color, we may pick another threshhold value or change algo :|
    return yiq >= 190 ? "#000000" : "#FFFFFF";
  };

}
