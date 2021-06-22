/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { Point3d } from "@bentley/geometry-core";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";

export interface CommentsListPreferReturnMinimal {
  comments?: CommentGetPreferReturnMinimal[];
}

export interface CommentGetPreferReturnMinimal {
  /** String that uniquely identifies this comment. */
  id?: string;

  /** The contents of the comment. */
  text?: string;

  /** Display name (i.e., given name and surname) of the user who posted this comment. (If the comment was posted using this API, it is inferred to be the authorized user making the request.) */
  authorDisplayName?: string;

  /**
   * Date and time the comment was posted.
   * @format date-time
   */
  createdDateTime?: string;

  /** Will only be set if the comment is a workflow transition note. This is the name of the status the issue was in before the transition. */
  workflowNoteFrom?: string;

  /** Will only be set if the comment is a workflow transition note. This is the name of the status the issue is in after the transition. */
  workflowNoteTo?: string;
  _links?: { author?: { _href?: string } };
}

export interface CommentsListPreferReturnRepresentation {
  comments?: CommentGetPreferReturnRepresentation[];
}

export interface CommentGetPreferReturnRepresentation {
  /** String that uniquely identifies this comment. */
  id?: string;

  /** The contents of the comment. */
  text?: string;

  /** Display name (i.e., given name and surname) of the user who posted this comment. (If the comment was posted using this API, it is inferred to be the authorized user making the request.) */
  author?: string;

  /** Email address of the user who wrote this comment. */
  authorEmail?: string;

  /**
   * Date and time the comment was posted.
   * @format date-time
   */
  createdDateTime?: string;

  /** Will only be set if the comment is a workflow transition note. This is the name of the status the issue was in before the transition. */
  workflowNoteFrom?: string;

  /** Will only be set if the comment is a workflow transition note. This is the name of the status the issue is in after the transition. */
  workflowNoteTo?: string;
  _links?: { author?: { _href?: string } };
}

export interface CommentCreate {
  /** The text of the comment. */
  text?: string;
}

export interface AttachmentMetadataList {
  attachments?: AttachmentMetadataGet[];
}

export interface AttachmentMetadataGet {
  /** Read-only. String that uniquely identifies this attachment and can be used in the `Get attachment file by ID` request to download the file. */
  id?: string;

  /** The name of the file that was uploaded. */
  fileName?: string;

  /** Read-only. File extension of the uploaded file. Derived from fileName. */
  type?: string;

  /** Descriptive string provided by a user for this attachment, if any. */
  caption?: string;

  /**
   * Date and time the attachment was uploaded. Read-only; auto-set when attachment is created.
   * @format date-time
   */
  createdDateTime?: string;

  /** Size of the file in bytes. Read-only; auto-set when attachment is created. */
  size?: number;

  /** If the attachment was uploaded from an Image Drop control, this is the property name the control is bound to. Otherwise, null. */
  binding?: string;
}

export interface AttachmentMetadataCreate {
  /** The file's filename. This will determine the MIME type of the file when requested. */
  fileName?: string;

  /** A string describing the significance of this attachment. */
  caption?: string;

  /** If this attachment is being created from an Image Drop control, this associates the attachment with that control. */
  binding?: string;
}

export interface AuditTrail {
  auditTrailEntries?: AuditTrailEntryGet[];
}

/**
 * Information about a single occurrence of a change to this issue.
 */
export interface AuditTrailEntryGet {
  /** String that uniquely identifies this entry. */
  id?: string;

  /** The display name (i.e., given name and surname) of the user who made this change. */
  changeBy?: string;

  /** The GUID of the user who made this change. */
  changeById?: string;

  /**
   * The date and time of this change.
   * @format date-time
   */
  changeDateTime?: string;

  /** The type of change that was made to the issue.  Possible values: 'Created', 'Modified', 'Assigned', 'Status', 'Closed', 'Opened', 'Draft', 'Deleted', 'Undeleted', 'File Attached', 'File Removed', 'Form Raised' */
  action?:
  | "Created"
  | "Modified"
  | "Assigned"
  | "Status"
  | "Closed"
  | "Opened"
  | "Draft"
  | "Deleted"
  | "Undeleted"
  | "File Attached"
  | "File Removed"
  | "Form Raised";

  /** The individual property modifications that were made in this changeset. */
  changes?: { property?: string, oldValue?: string, newValue?: string }[];
}

export interface FormDefinitionList {
  formDefinitions?: FormDefinitionSummary[];
}

export interface FormDefinitionSummary {
  /** Unique ID for this form definition. */
  id?: string;

  /** The name of this form definition as it is displayed to users in the Form Manager UI and Issues webapp UI. */
  displayName?: string;

  /** The issue type that can be created from this form definition. */
  type?: string;
}

export interface WorkflowResponseGet {
  workflow?: WorkflowGet;
}

export interface WorkflowGet {
  /** Unique identifier for this workflow. */
  id?: string;

  /** The names of all the states that can be chosen for a newly-created issue's `status` property. */
  startStates?: string[];

  /** The issue type this workflow applies to. */
  type?: string;

  /** A list of possible workflow states, i.e. possible values of the `status` issue property. */
  states?: WorkflowState[];

  /** A list of valid workflow transitions. The `status` property of an issue can only be changed if there is a transition, accessible to the current user, whose `start` property matches the current value of the `status` property of the issue, and whose `end` property matches the new `status` value. */
  transitions?: WorkflowTransition[];

  /** Transitions that govern setting the `status` property of a brand-new issue. These will each have a null value for `start` and a starting state name for `end`. Clients should not depend on this array existing or including a transition for every start state, but should still allow the user to select any start state when creating a new issue. */
  startingTransitions?: any[];

  /** Workflow state representing the status of a new issue, before it has been saved. This mainly just determines (through the `editableProperties` array) which properties can be set on the issue's initial save. Even though this state's `name` property may be null, the issue's `status` property will have to be set to a valid, non-null value that matches one of the start state names. */
  uninitializedState?: object;
}

export interface WorkflowState {
  /** The name of this state. This is used both for display purposes and to uniquely identify this state within the workflow. If an issue has a workflow, its `status` property must match a state's `name` property. */
  name?: string;

  /** A hexadecimal RGB color string, e.g. '#ff0000'. This provides a hint to clients on how to highlight issues based on their current `status` property. Not all clients use, or are required to use, this property, and it may be null. */
  color?: string;

  /** The names of properties that can be edited while the workflow is in this state. */
  editableProperties?: string[];

  /** Classifies this state as a 'Closed', 'Open', or 'Draft' state. While the issue is in this state, its `state` property will automatically be set to this string. */
  stateCategory?: "Closed" | "Open" | "Draft";
}

export interface WorkflowTransition {
  /** The name of this transition, i.e. the text that should appear on the UI element that triggers this transition. */
  displayName?: string;

  /** The name of the workflow state where this transition begins. */
  start?: string;

  /** The name of the workflow state where this transition ends. */
  end?: string;

  /** Denotes whether the transition allows or requires a workflow note to be set when it is triggered (`workflowNote` property on `Issue Update` object). Possible values: 'None', 'Optional', 'Required'. */
  notes?: "None" | "Optional" | "Required";
}

export interface FormDefinitionDetailsResponse {
  formDefinition?: FormDefinitionDetails;
}

export interface FormDefinitionDetails {
  /** Unique identifier for this form definition. Can be set as the formId property in the 'Create issue' request body. */
  id?: string;

  /** The name of this form definition as it should be displayed to users if they are choosing which form definition to use for a new issue. */
  displayName?: string;

  /** Determines which issue type will be created when this form definition is used. */
  type?: string;

  /** A JSON string defining this form's layout, including all of its controls and their bindings, locations, and styles. */
  definition?: string;

  /** The form definition's availability. This can be set by a project administrator. Only forms set to Approved can be used to create issues. Possible values: 'Draft', 'Approved', 'Archived'. */
  status?: "Draft" | "Approved" | "Archived";

  /** String describing whether the form definition has problems that could prevent it from displaying (Warning) or functioning (Error or Critical) correctly. Possible values: 'None', 'Warning', 'Error', 'Critical', 'Unknown'. */
  errorStatus?: "None" | "Warning" | "Error" | "Critical" | "Unknown";
}

export interface StaticImageResponse {
  /** A URL of the static image file, which can be placed in an <img> tag's 'src' attribute. */
  _links?: StaticImageLink;
}

export interface ListGroupResponse {
  listGroup?: ListGroup;
}

export interface ListGroup {
  /** The unique ID of this list group. Will be the same as the list group ID in the URL. */
  id?: string;

  /** The names of the lists defined by this list group, from outermost (first) to innermost (last). */
  lists?: string[];

  /** A recursive data structure defining the options available in these lists. Its properties can have any name. For each property in the outermost object, its key should be used as the name of an option in the first list, and its value is an object whose keys correspond to the options that become available in the second list when that particular first-list option is chosen, and so forth. This pattern continues down to the last list, whose options will be represented by properties with empty object values. */
  optionsTree?: DynamicObject;
}

export interface IssuesList {
  issues?: IssueSummary[];

  /** URLs for redoing the current request or getting the next page of results, if applicable. Links to the previous page are not available. */
  _links?: ForwardOnlyPagingLinks;
}

export interface IssueSummary {
  /** The issue's unique ID. Can be used to query for issue details with the Get Issue Details endpoint. */
  id?: string;

  /** Name that should be used to display this issue to users. */
  displayName?: string;

  /** Describes which domain of work the issue involves, which determines what applications will show it. Only certain values are supported. Possible values: 'Civil Design', 'Clash', 'Closeout', 'Communication', 'Deficiency', 'Design', 'Field Data', 'Issue', 'Observation', 'Other', 'Punchlist', 'Risk', 'RFI', 'Submittal Issue', 'Task', 'Transmittal Issue' */
  type?:
  | "Civil Design"
  | "Clash"
  | "Closeout"
  | "Communication"
  | "Deficiency"
  | "Design"
  | "Field Data"
  | "Issue"
  | "Observation"
  | "Other"
  | "Punchlist"
  | "Risk"
  | "RFI"
  | "Submittal Issue"
  | "Task"
  | "Transmittal Issue";

  /** Indicates whether the issue's current workflow status is an Open, Closed, or Draft status. */
  state?: "Closed" | "Open" | "Draft";
}

export interface IssueDetailsGet {
  /** Contains the full data of this issue. Any property that was never set on the issue will be omitted from the response. */
  issue?: IssueGet;
}

/**
 * Contains the full data of this issue. Any property that was never set on the issue will be omitted from the response.
 */
export interface IssueGet {
  /** Unique identifier for this instance. Read-only. */
  id?: string;

  /** Name that should be used to show this issue in a list of issues in the UI. This is read-only. Project managers can configure how this is generated; usually, it will be the value of another property. */
  displayName?: string;

  /** The ID of the form definition that this issue was created with. Note: This property will only be returned during the 'Get issue details' query, not in the result of a Create or Modify operation. */
  formId?: string;

  /** Brief title/description of the issue. */
  subject?: string;

  /** Detailed description of the issue. */
  description?: string;

  /** Describes which domain of work the issue involves, which determines what applications will show it. Only certain values are supported. Possible values: 'Civil Design', 'Clash', 'Closeout', 'Communication', 'Deficiency', 'Design', 'Field Data', 'Issue', 'Observation', 'Other', 'Punchlist', 'Risk', 'RFI', 'Submittal Issue', 'Task', 'Transmittal Issue' */
  type?:
  | "Civil Design"
  | "Clash"
  | "Closeout"
  | "Communication"
  | "Deficiency"
  | "Design"
  | "Field Data"
  | "Issue"
  | "Observation"
  | "Other"
  | "Punchlist"
  | "Risk"
  | "RFI"
  | "Submittal Issue"
  | "Task"
  | "Transmittal Issue";

  /** An human-readable identifier for the issue, consisting of an alphanumeric prefix (that can be configured by the project administrator) followed by an auto-incrementing number. Read-only. */
  number?: string;

  /** The date by which an action should be taken on this issue. Applications will use this to determine whether an issue is near due or overdue. */
  dueDate?: string;

  /** The current workflow status the issue is in right now. */
  status?: string;

  /** Indicates whether the issue's status is an Open, Closed, or Draft status. This property is read-only. */
  state?: string;

  /** The primary user or role assigned to this issue. */
  assignee?: PrimaryAssignee;

  /** For cases when an issue is assigned to multiple people and/or roles, this lists all of them rather than just the primary assignee. */
  assignees?: SecondaryAssignee[];

  /** The display name of the user who originally created this issue. Read-only. */
  createdBy?: string;

  /** The date and time when this issue was originally created. Read-only. */
  createdDateTime?: string;

  /** The display name of the user who most recently made a change to this issue. Read-only. */
  lastModifiedBy?: string;

  /** The date and time when this issue was most recently edited. Read-only. */
  lastModifiedDateTime?: string;

  /** Origin info. Describes an object, like a model element or a file, that an issue pertains to. */
  item?: IssueLinkedItem;

  /** Origin info. Describes an object that contains the item, if applicable (like a folder that contains the file, or a model that contains the element). */
  container?: IssueLinkedItem;

  /** Origin info. In cases where an issue is associated with two items, provides a way to identify the second item. */
  elementId?: string;

  /** Origin info. Describes a rectangular-prism-shaped region in a 3D model that the issue pertains to. */
  boundingBox?: BoundingBox;

  /** Origin info. Associates an issue with a single point in a model that does not necessarily correspond to a model element. */
  modelPin?: ModelPin;

  /** Origin info. Describes the view that was visible when the issue was created. */
  modelView?: ModelView;

  /**
   * The date and time represented in the model where the issue occurred (if in a 4D model).
   * @format date-time
   */
  modelEventDateTime?: string;

  /** Origin info. The geographical location the issue pertains to. */
  location?: Location;

  /** Contains all issue-type-specific and user-defined properties that were set on this issue.  Properties set here may be strings, numbers, booleans, arrays, or objects, depending on how the project's administrator defined them in the Form Designer. */
  properties?: DynamicObject;
}

/**
 * Provides new property values for properties that are being changed in the update. All properties are optional. Omitting a property will keep its current value intact.
 */
export interface IssueUpdate {
  /** Brief title/description of the issue. */
  subject?: string;

  /** Detailed description of the issue. */
  description?: string;

  /** The date by which an action should be taken on this issue. Applications will use this to determine whether an issue is near due or overdue. */
  dueDate?: string;

  /** The issue's new workflow status, if applicable. */
  status?: string;

  /** Text of a comment to associated with the status change. This property MUST NOT be set UNLESS the 'status' property is also set AND the workflow for the issue's type allows a workflow note to be added for transitions from the old status to the new status. */
  workflowNote?: string;

  /** The primary user or role assigned to this issue. */
  assignee?: PrimaryAssignee;

  /** For cases when an issue is assigned to multiple people and/or roles, this lists all of them rather than just the primary assignee. */
  assignees?: SecondaryAssignee[];

  /** Origin info. Describes an object, like a model element or a file, that an issue pertains to. */
  item?: IssueLinkedItem;

  /** Origin info. Describes an object that contains the item, if applicable (like a folder that contains the file, or a model that contains the element). */
  container?: IssueLinkedItem;

  /** Origin info. In cases where an issue is associated with two items, provides a way to identify the second item. */
  elementId?: string;

  /** Origin info. Describes a rectangular-prism-shaped region in a 3D model that the issue pertains to. */
  boundingBox?: BoundingBox;

  /** Origin info. Associates an issue with a single point in a model that does not necessarily correspond to a model element. */
  modelPin?: ModelPin;

  /** Origin info. Describes the view that was visible when the issue was created. */
  modelView?: ModelView;

  /**
   * The date and time represented in the model where the issue occurred (if in a 4D model).
   * @format date-time
   */
  modelEventDateTime?: string;

  /** Origin info. The geographical location the issue pertains to. */
  location?: Location;

  /** Any custom properties that are defined in the Form Designer for issues of this issue's type may be set here. If this object is omitted or set to null, all custom properties will retain their current values. */
  properties?: DynamicObject;
}

/**
 * Sets property values for an issue being newly created.
 */
export interface IssueCreate {
  /** The ID of the form definition (obtained from the Get project form definitions query) to associate this issue with. The chosen form definition will be used to display the issue in the Issues webapp and other Bentley applications. If no form definition exists in the current project for the issue type you wish to create, please have a project administrator create or import such a form definition using Bentley's Form Designer. */
  formId?: string;

  /** Brief title/description of the issue. */
  subject?: string;

  /** Detailed description of the issue. */
  description?: string;

  /** The date by which an action should be taken on this issue. Applications will use this to determine whether an issue is near due or overdue. */
  dueDate?: string;

  /** The issue's new workflow status, if applicable. */
  status?: string;

  /** The primary user or role assigned to this issue. Defaults to current user if not specified. */
  assignee?: PrimaryAssignee;

  /** For cases when an issue is assigned to multiple people and/or roles, this lists all of them rather than just the primary assignee. */
  assignees?: SecondaryAssignee[];

  /** Origin info. Describes an object, like a model element or a file, that an issue pertains to. */
  item?: IssueLinkedItem;

  /** Origin info. Describes an object that contains the item, if applicable (like a folder that contains the file, or a model that contains the element). */
  container?: IssueLinkedItem;

  /** Origin info. In cases where an issue is associated with two items, provides a way to identify the second item. */
  elementId?: string;

  /** Origin info. Describes a rectangular-prism-shaped region in a 3D model that the issue pertains to. */
  boundingBox?: BoundingBox;

  /** Origin info. Associates an issue with a single point in a model that does not necessarily correspond to a model element. */
  modelPin?: ModelPin;

  /** Origin info. Describes the view that was visible when the issue was created. */
  modelView?: ModelView;

  /**
   * The date and time represented in the model where the issue occurred (if in a 4D model).
   * @format date-time
   */
  modelEventDateTime?: string;

  /** Origin info. The geographical location the issue pertains to. */
  location?: Location;

  /** Any custom properties that are defined in the Form Designer for issues of this issue's type may be set here. */
  properties?: DynamicObject;
}

/**
 * An object describing the primary user or role assigned to an issue.
 */
export interface PrimaryAssignee {
  /** The GUID identifying the user or role. */
  id?: string;

  /** The role's name, or the user's given name and surname, as it should be displayed in an application. */
  displayName?: string;
}

/**
 * An object describing one of potentially several users or roles assigned to an issue.
 */
export interface SecondaryAssignee {
  /** The GUID identifying the user or role. */
  id?: string;

  /** The role's name, or the user's given name and surname, as it should be displayed in an application. */
  displayName?: string;

  /** If true, this is a role; otherwise, it is an individual user. */
  isRole?: boolean;
}

export interface IssueLinkedItem {
  /** The string uniquely identifying this linked item in the system that manages it. */
  id?: string;

  /** A link that would allow the user to view the linked item, or details about it, if followed. */
  url?: string;

  /** Text that should be displayed on the link to this item, if it is shown in a UI. */
  displayName?: string;
}

/**
 * Origin info. Describes a rectangular-prism-shaped region in a 3D model that the issue pertains to.
 */
export interface BoundingBox {
  /** The lower-left corner of the region. */
  lowerLeftPoint3d?: Point3d;

  /** The upper-right corner of the region. */
  upperRightPoint3d?: Point3d;
}

/**
 * Origin info. Associates an issue with a single point in a model that does not necessarily correspond to a model element.
 */
export interface ModelPin {
  /** The location of the pin. */
  location?: Point3d;

  /** String describing the relevance of the pin's location. */
  description?: string;
}

/**
 * Origin info. Describes the view that was visible when the issue was created.
 */
export interface ModelView {
  /** An object describing the view that can be parsed by non-IModelJS applications. */
  cameraView?: Camera;

  /** A string defining the view according to IModelJS standards. */
  iModelJsView?: string;
}

export interface Camera {
  /** The location of the camera within the model. */
  viewPoint?: Point3d;

  /** Endpoint of a vector from the origin that determines the camera's facing direction. */
  direction?: Point3d;

  /** Endpoint of a vector from the origin that determines which direction appears as upwards in the view. */
  up?: Point3d;

  /**
   * Determines the zoom level of the camera, i.e. how much to multiply 1 distance unit in the view by to get the actual distance in meters in the model. Either this or fieldOfView should be specified, but not both.
   * @format double
   */
  viewToWorldScale?: number;

  /**
   * Determines the number of degrees in the circular arc around the camera's position that is visible in the view. Either this or viewToWorldScale should be specified, but not both.
   * @format double
   */
  fieldOfView?: number;
}

/**
 * Origin info. The geographical location the issue pertains to.
 */
export interface Location {
  /**
   * The degrees latitude of the issue's location. North: positive, south: negative.
   * @format double
   */
  latitude?: number;

  /**
   * The degrees longitude of the issues location. East: positive, west: negative.
   * @format double
   */
  longitude?: number;

  /**
   * The geographical elevation above/below sea level. Units for this property are not standardized, so an application should not make assumptions about this property's value set by other applications unless that other application's units are known.
   * @format double
   */
  elevation?: number;

  /** A string describing the significance of this location. */
  description?: string;
}

/**
 * An object whose properties can vary depending on user customization within the project.
 */
export type DynamicObject = any;

export interface ExportFileToShareResponse {
  file?: ExportFileToShareResponseEntity;
}

export interface ExportFileToShareResponseEntity {
  /** The name of the exported file. (If multiple files were generated for this request, each beyond the first will start with the same name, but with a number in parentheses added just before the file extension.) */
  fileName?: string;

  /** Links to view the folder where the file was placed, view the file metadata, or download the file contents. The fileMetadata link can also be used to delete the file. */
  _links?: ExportFileToShareLinks;
}

/**
 * Links to view the folder where the file was placed, view the file metadata, or download the file contents. The fileMetadata link can also be used to delete the file.
 */
export interface ExportFileToShareLinks {
  fileDownload?: Link;
  destinationFolder?: Link;
  fileMetadata?: Link;
}

/**
 * URLs for redoing the current request or getting the next page of results, if applicable. Links to the previous page are not available.
 */
export interface ForwardOnlyPagingLinks {
  self?: Link;
  next?: Link;
}

/**
 * A URL of the static image file, which can be placed in an <img> tag's 'src' attribute.
 */
export interface StaticImageLink {
  imageUrl?: Link;
}

export interface Link {
  href?: string;
}

/**
 * Gives details for an error that occurred while handling the request. Note that clients MUST NOT assume that every failed request will produce an object of this schema, or that all of the properties in the response will be non-null, as the error may have prevented this response from being constructed.
 */
export interface ErrorResponse {
  error?: { code?: string, message?: string };
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Image = "image/png",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://api.bentley.com/issues/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private requestContext: AuthorizedClientRequestContext;

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(requestContext: AuthorizedClientRequestContext, apiConfig: ApiConfig<SecurityDataType> = {}) {
    this.requestContext = requestContext
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private addQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];

    return (
      `${encodeURIComponent(key)
      }=${
        encodeURIComponent(Array.isArray(value) ? value.join(",") : typeof value === "number" ? value : `${value}`)}`
    );
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) =>
        typeof query[key] === "object" && !Array.isArray(query[key])
          ? this.toQueryString(query[key] as QueryParamsType)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((data, key) => {
        data.append(key, input[key]);
        return data;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
    [ContentType.Image]: (input: any) => input,
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format = "json",
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams = (secure && this.securityWorker && (await this.securityWorker(this.securityData))) || {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];

    return fetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
        Authorization: this.requestContext.accessToken.toTokenString(), // TODO: Remove hardcoded bearer token and uncomment this line
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = (null as unknown) as T;
      r.error = (null as unknown) as E;

      const data = await response[format]()
        .then((data) => {
          if (r.ok) {
            r.data = data;
          } else {
            r.error = data;
          }
          return r;
        })
        .catch((e) => {
          r.error = e;
          return r;
        });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Issues
 * @version v1
 * @baseUrl https://api.bentley.com/issues/v1
 *
 * Issue Service
 *
 * View, create, and edit details of issues that have been raised in a CONNECT project or context, as well as their comments, attached files, and change history.  Retrieval of form definitions (which define how to display an issue in an interactive UI) is also supported, though customization of them is not (and should be done by a project administrator through the CONNECT Issues web application, if needed).
 */
export class IssuesClient<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description --- Creates a new issue. The user must specify the ID of a form definition to associate the issue with; that will set its issue type as well as determine how clients such as the CONNECT Issues web app will display it. The form definition ID should be obtained by calling the 'Get project form definitions' endpoint. For compatibilty with JSON schema specifications, some property types are presented as "All of: [some object type name]".  This simply means the value should be a single object of that type. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
   *
   * @tags Issues
   * @name CreateIssue
   * @summary Create issue
   * @request POST:/
   * @secure
   */
  createIssue = async (data: IssueCreate, params: RequestParams = {}) =>
    this.request<IssueGet, ErrorResponse | void>({
      path: `/`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description --- Retrieves a list of issues for the project with the given ID.  This only returns basic info about each issue--its ID, display name, type, and whether it is in an Open, Closed, or Draft state.  Use the "Get Issue Details" endpoint to see full information about a particular issue. Note that the 'projectId' query string parameter is required. It must be a valid project GUID to get issues from. ### Authentication Requires *Authorization* header with valid OIDC token for scope *issues:read*. ---
   *
   * @tags Issues
   * @name GetProjectIssues
   * @summary Get project issues
   * @request GET:/
   * @secure
   */
  getProjectIssues = async (
    query: {
      type?:
      | "Punchlist"
      | "Civil Design"
      | "Clash"
      | "Closeout"
      | "Communication"
      | "Defiiciency"
      | "Design"
      | "Field Data"
      | "Issue"
      | "Observation"
      | "Other"
      | "Risk"
      | "RFI"
      | "Task";
      $top?: number;
      continuationToken?: string;
      projectId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<IssuesList, void | ErrorResponse>({
      path: `/`,
      method: "GET",
      query,
      secure: true,
      format: "json",
      ...params,
    });

  formDefinitions = {
    /**
     * @description --- Gets the full form definition with the specified ID. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags FormDefinitions
     * @name GetFormDefinitionById
     * @summary Get form definition by ID
     * @request GET:/formDefinitions/{id}
     * @secure
     */
    getFormDefinitionById: async (id: any, params: RequestParams = {}) =>
      this.request<FormDefinitionDetailsResponse, void | ErrorResponse>({
        path: `/formDefinitions/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description --- Gets a link to a static image to be displayed in a form. The 'fileId' parameter should match the 'fileId' property of a static image control in the form's definition.  It will be a positive integer.  This endpoint returns only a _links object containing the URL of the actual file, which is publicly available and can be set as the 'src' attribute of an HTML <img> tag to display the image. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags FormDefinitions
     * @name GetStaticImage
     * @summary Get static image
     * @request GET:/formDefinitions/{id}/staticImages/{fileId}
     * @secure
     */
    getStaticImage: async (id: string, fileId: number, params: RequestParams = {}) =>
      this.request<StaticImageResponse, void | ErrorResponse>({
        path: `/formDefinitions/${id}/staticImages/${fileId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description --- Retrieves a list of Approved form definitions for the project with the given ID.  This only returns the definition's name, type, and ID. The full definitions will be returned in the 'Get form definition by ID' endpoint. Note that in order to create an issue, it must be associated with the ID of one of these form definitions (through the 'formId' property in the 'Create issue' request body). If the project does not have any form definitions of the issue type you need, a project administrator should use the Bentley Form Manager (accessible through the Forms or Issues webapp) to create or import one. Note that the 'projectId' query string parameter is required. It must be a valid project GUID to get form definitions from. ### Authentication Requires *Authorization* header with valid OIDC token for scope *issues:read*. ---
     *
     * @tags FormDefinitions
     * @name GetProjectFormDefinitions
     * @summary Get project form definitions
     * @request GET:/formDefinitions
     * @secure
     */
    getProjectFormDefinitions: async (query: { projectId: string, type?: string }, params: RequestParams = {}) =>
      this.request<FormDefinitionList, void | ErrorResponse>({
        path: `/formDefinitions`,
        method: "GET",
        query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description --- Use this request to look up a list group, which is a nested object structure that defines the options available in a chain of cascading list form controls. (Cascading lists are a set of &lt;select&gt; elements where only the first one is initially enabled until an option in it is selected, and then, depending on which option was selected, the available options in the next list can vary.) Each property in the structure represents an option in a select list, and its children represent options that become available in the next list in the chain if that option is selected. ### Sample Explanation The sample for the 200 response shows an example of a list group that could be assigned to 3 controls in a form to let the user pick an American football team by conference, division, and name. Since the result has two properties ("AFC" and "NFC") as direct children of the "optionsTree" property, the first list in the cascading list chain would have two options--"AFC" and "NFC".  Whichever option is chosen, its child properties become available for selection in the second list, and so forth.  For example, if "AFC" and "North" were chosen for the first two lists respectively, the third list would show the available options "Bengals", "Browns", "Ravens", and "Steelers".  These four properties just have empty objects as their values because this particular list group only has three layers; these options are the final options in the chain and have no descendants. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags FormDefinitions
     * @name GetListGroup
     * @summary Get list group
     * @request GET:/formDefinitions/{id}/listGroups/{listGroupId}
     * @secure
     */
    getListGroup: async (id: string, listGroupId: string, params: RequestParams = {}) =>
      this.request<ListGroupResponse, void | ErrorResponse>({
        path: `/formDefinitions/${id}/listGroups/${listGroupId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  id = {
    /**
     * @description --- Retrieves the metadata for all files attached to the given issue. In order to get the contents of a file itself, use the `Get attachment file by ID` endpoint, passing the `id` from the metadata object returned by this request as the `attachmentId` parameter of that request. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags Attachments
     * @name GetIssueAttachments
     * @summary Get issue attachments
     * @request GET:/{id}/attachments
     * @secure
     */
    getIssueAttachments: async (id: string, params: RequestParams = {}) =>
      this.request<AttachmentMetadataList, void | ErrorResponse>({
        path: `/${id}/attachments`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description --- Adds a new attachment to the specified issue. This only creates the attachment metadata; the file will need to be uploaded through a subsequent PUT call to the URL returned in the Location header of this endpoint's response. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
     *
     * @tags Attachments
     * @name AddAttachmentToIssue
     * @summary Add attachment to issue
     * @request POST:/{id}/attachments
     * @secure
     */
    addAttachmentToIssue: async (id: string, data: AttachmentMetadataCreate, params: RequestParams = {}) =>
      this.request<void, ErrorResponse | void>({
        path: `/${id}/attachments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description --- Deletes the specified attachment (including both its metadata and file) from the specified issue. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
     *
     * @tags Attachments
     * @name DeleteAttachment
     * @summary Delete attachment
     * @request DELETE:/{id}/attachments/{attachmentId}
     * @secure
     */
    deleteAttachment: async (id: string, attachmentId: string, params: RequestParams = {}) =>
      this.request<void, void | ErrorResponse>({
        path: `/${id}/attachments/${attachmentId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description --- Retrieves the actual file contents for the attachment with the given ID. This API will attempt to infer the MIME type to return from the file's extension, but will return the default value of `application/octet-stream` if it does not recognize the extension. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags Attachments
     * @name GetAttachmentById
     * @summary Get attachment file by ID
     * @request GET:/{id}/attachments/{attachmentId}
     * @secure
     */
    getAttachmentById: async (id: string, attachmentId: string, params: RequestParams = {}) =>
      this.request<void, void | ErrorResponse>({
        path: `/${id}/attachments/${attachmentId}`,
        method: "GET",
        secure: true,
        format: "blob",
        ...params,
      }),

    /**
     * @description --- Uploads a file's contents, associating it with the attachment metadata instance with the given ID. The request body is simply the file's bytes. If a file was already uploaded for the attachment with the given ID, that file will be overwritten. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
     *
     * @tags Attachments
     * @name UploadAttachmentFile
     * @summary Upload attachment file
     * @request PUT:/{id}/attachments/{attachmentId}
     * @secure
     */
    uploadAttachmentFileDeprecated: async (id: string, attachmentId: string, body: string, params: RequestParams = {}) =>
      this.request<void, void | ErrorResponse>({
        body,
        path: `/${id}/attachments/${attachmentId}`,
        type: ContentType.Image,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description --- Deletes the issue with the specified ID. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
     *
     * @tags Issues
     * @name DeleteIssue
     * @summary Delete issue
     * @request DELETE:/{id}
     * @secure
     */
    deleteIssue: async (id: string, params: RequestParams = {}) =>
      this.request<void, void | ErrorResponse>({
        path: `/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description --- Modifies the provided properties of the specified issue to match the values provided in the request. Setting a property value to null in the request will set the corresponding property value to null on the issue. However, omitting a property from the request body entirely will leave that property's current value on the issue unchanged.  Also, setting an object (other than "properties") to null will have the same effect as setting each individual property in that object to null. For compatibilty with JSON schema specifications, some property types are presented as "All of: [some object type name]".  This simply means the value should be a single object of that type. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
     *
     * @tags Issues
     * @name ModifyIssue
     * @summary Update issue
     * @request PATCH:/{id}
     * @secure
     */
    modifyIssue: async (id: string, data: IssueUpdate, params: RequestParams = {}) =>
      this.request<IssueGet, ErrorResponse | void>({
        path: `/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description --- Retrieves all properties of the specified issue. Known, common properties will be returned directly on the 'issue' object, whereas custom properties unique to the issue's type will be returned on the 'properties' sub-object. For compatibilty with JSON schema specifications, some property types are presented as "All of: [some object type name]".  This simply means the value should be a single object of that type. Note that many properties in the schema are described as 'Origin info.' This means that they are metadata about where the issue came from and what business domain object(s) it is related to, such as a PDF file or a 3D model. Their meanings can differ from application to application. Many applications will use only a subset of these properties, and in general applications SHOULD NOT use or set these values unless they have a good reason to do so. Other properties, not marked 'Origin info', will commonly be set on most issues, but clients SHOULD NOT assume that all of them are set. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags Issues
     * @name GetIssueDetails
     * @summary Get issue details
     * @request GET:/{id}
     * @secure
     */
    getIssueDetails: async (id: string, params: RequestParams = {}) =>
      this.request<IssueDetailsGet, void | ErrorResponse>({
        path: `/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description --- Gets the specified issue exported to the specified file format. Currently, the default--and only supported format--is PDF. The issue with the specified ID will be laid out in the PDF according to its associated form definition. The generated PDF will have a header at the top of each page with metadata about the issue (such as its name and creation date) unless the 'includeHeader' query parameter is set to false. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @name DownloadIssueAsFile
     * @summary Download issue as file
     * @request GET:/{id}/download
     * @secure
     */
    downloadIssueAsFile: async (
      id: string,
      query?: { fileType?: "pdf", includeHeader?: true | false },
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorResponse | void>({
        path: `/${id}/download`,
        method: "GET",
        query,
        secure: true,
        ...params,
      }),

    /**
     * @description --- Adds a new comment to the specified issue. Only the comment text is needed; the author and creation time will be automatically set by the server. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
     *
     * @tags Comments
     * @name AddCommentToIssue
     * @summary Add comment to issue
     * @request POST:/{id}/comments
     * @secure
     */
    addCommentToIssue: async (id: any, data: CommentCreate, params: RequestParams = {}) =>
      this.request<void, ErrorResponse | void>({
        path: `/${id}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description --- Retrieves the text and metadata for all comments that have been posted to the given issue. If the Prefer header was specified with the value "return=representation", the response will include the email address of each comment author, though this may incur additional processing time.  If there is an extraordinarily large number of comments, only 50 distinct user email addresses will be retrieved and shown. Regardless of the Prefer header value, the "_links" object associated with each comment will provide a link to additional information about the comment author. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags Comments
     * @name GetIssueComments
     * @summary Get issue comments
     * @request GET:/{id}/comments
     * @secure
     */
    getIssueComments: async (id: string, params: RequestParams = {}) =>
      this.request<CommentsListPreferReturnMinimal, void | ErrorResponse>({
        path: `/${id}/comments`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description --- Deletes the specified comment from the specified issue. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:modify*. ---
     *
     * @tags Comments
     * @name DeleteComment
     * @summary Delete comment
     * @request DELETE:/{id}/comments/{commentId}
     * @secure
     */
    deleteComment: async (id: string, commentId: string, params: RequestParams = {}) =>
      this.request<void, void | ErrorResponse>({
        path: `/${id}/comments/${commentId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description --- Retrieves a reverse-chronologically-ordered list of all changes that have been made to this issue, including authors, dates, and old vs. new property values. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags AuditTrail
     * @name GetIssueAuditTrail
     * @summary Get issue audit trail
     * @request GET:/{id}/auditTrailEntries
     * @secure
     */
    getIssueAuditTrail: async (id: string, params: RequestParams = {}) =>
      this.request<AuditTrail, void | ErrorResponse>({
        path: `/${id}/auditTrailEntries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  workflows = {
    /**
     * @description --- Retrieves the workflow for the given issue type in the given project. The project must be specified using the 'projectId' query string parameter. It is possible for users of a project to choose not to set a workflow for a given type. In that case, requests to get the workflow of that type will return a 404 Not Found response where the 'code' property of the body's 'error' object is set to "WorkflowNotFound". This does not indicate client error. Other HTTP status codes, or other values of the 'code' property, do indicate an unexpected error of some sort. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @tags Workflow
     * @name GetWorkflow
     * @summary Get workflow
     * @request GET:/workflows/{type}
     * @secure
     */
    getWorkflow: async (type: string, query: { projectId: string }, params: RequestParams = {}) =>
      this.request<WorkflowResponseGet, ErrorResponse | void>({
        path: `/workflows/${type}`,
        method: "GET",
        query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  storageExport = {
    /**
     * @description --- Requests that anywhere from 1 to 5 issues be exported to a file and saved in cloud-based project storage (accessible through the Storage API). Currently 'pdf' is the only supported file type. The IDs of the issues must be specified in a query string parameter named "ids", separated by commas if there is more than one. A sample request URL that exports 3 issues to a PDF is as follows-- https://api.bentley.com/issues/exportPdfToStorage?ids=abab23524535,89458jjlij,32636wtewtwt&folderId=090909877987&includeHeader=true Note that unlike most GET requests, this is not an idempotent operation; each time it is called, a new file will be generated. The response will not contain the file itself, but links to download it from Storage. All issues specified in the request must come from the same project, or the request will fail. The client may also specify the ID of a destination folder where the file should be saved; otherwise, it will be saved in the project's root folder.  They can also specify whether to include a textual header with issue metadata at the top of each page (default) or exclude it. ### Authentication Requires *Authorization* header with valid Bearer token for scope *issues:read*. ---
     *
     * @name ExportIssuesToStorage
     * @summary Export issues to Storage
     * @request GET:/storageExport
     * @secure
     */
    exportIssuesToStorage: async (
      query: { "ids ": string, includeHeader?: true | false, fileType?: "pdf", folderId?: string },
      params: RequestParams = {},
    ) =>
      this.request<ExportFileToShareResponse, ErrorResponse | void>({
        path: `/storageExport`,
        method: "GET",
        query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
