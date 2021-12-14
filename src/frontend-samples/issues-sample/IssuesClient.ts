/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/* eslint-disable */
/* tslint:disable */

import { Point3d } from "@itwin/core-geometry";
import { request, Response } from "@bentley/itwin-client";
import { IModelApp } from "@itwin/core-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";

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
 * Represents an element in an iModel about which an issue was created.
 */
export interface IModelElement {
  /** ID of the iModel containing the element, as it exists in the iModels API. */
  modelId: string;
  /** ID of the element. Can be a hexadecimal numeric string (space-separated to include multiple elements) or a presentation key. */
  elementId: string;
  /** ID of the changeset where the issue was created. */
  changeSetId: string;
  /** Name of the model. */
  modelName: string;
}

/**
 * Origin info. An object linking the issue to an entity outside the Issues service, such as a file in Storage or an element in an iModel, that the issue was created to pertain to.
 */
export interface SourceEntity {
  iModelElement: IModelElement;
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

  /** Origin info. An object linking the issue to an entity outside the Issues service, such as a file in Storage or an element in an iModel, that the issue was created to pertain to. */
  sourceEntity?: SourceEntity;

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
  properties?: any;
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

export default class IssuesClient {

  public static async getProjectIssues(projectId: string, type?: string, state?: string): Promise<IssuesList | undefined> {
    var url = `https://api.bentley.com/issues/?projectId=${projectId}`;
    if (type)
      url += `&type=${type}`

    if (state)
      url += `&state=${state}`

    const options = {
      method: "GET",
      headers: {
        Authorization: (await IssuesClient.getAccessToken())
      },
    };
    return request(url, options)
      .then((resp: Response): IssuesList | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  public static async getIssueDetails(id: string): Promise<IssueDetailsGet | undefined> {
    const url = `https://api.bentley.com/issues/${id}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: (await IssuesClient.getAccessToken()),
      },
    };
    return request(url, options)
      .then((resp: Response): IssueDetailsGet | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  public static async getIssueAttachments(id: string): Promise<AttachmentMetadataList | undefined> {
    const url = `https://api.bentley.com/issues/${id}/attachments`;
    const options = {
      method: "GET",
      headers: {
        Authorization: (await IssuesClient.getAccessToken())
      },
    };
    return request(url, options)
      .then((resp: Response): AttachmentMetadataList | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  public static async getAttachmentById(id: string, attachmentId: string): Promise<Blob | undefined> {
    const url = `https://api.bentley.com/issues/${id}/attachments/${attachmentId}`;
    return fetch(url, {
      method: "GET",
      headers: {
        Authorization: (await IssuesClient.getAccessToken())!
      },
    }).then(async (response) => {
      return await response.blob().then((data) => {
        if (response.ok) {
          return data
        } else {
          return undefined;
        }
      })
    });
  }

  public static async getIssueComments(id: string): Promise<CommentsListPreferReturnMinimal | undefined> {
    const url = `https://api.bentley.com/issues/${id}/comments`;
    const options = {
      method: "GET",
      headers: {
        Authorization: (await IssuesClient.getAccessToken()),
      },
    };
    return request(url, options)
      .then((resp: Response): CommentsListPreferReturnMinimal | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  public static async getIssueAuditTrail(id: string): Promise<AuditTrail | undefined> {
    const url = `https://api.bentley.com/issues/${id}/auditTrailEntries`;
    const options = {
      method: "GET",
      headers: {
        Authorization: (await IssuesClient.getAccessToken()),
      },
    };
    return request(url, options)
      .then((resp: Response): AuditTrail | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return (IModelApp.authorizationClient as AuthorizationClient).getAccessToken();
    } catch (e) {
      return undefined;
    }
  }
}
