/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useActiveIModelConnection, useActiveViewport } from "@bentley/ui-framework";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { HorizontalTabs, Select, Spinner, SpinnerSize, Timer } from "@bentley/ui-core";
import { Angle, Point3d, Vector3d } from "@bentley/geometry-core";
import { Body, IconButton, Leading, Subheading, Table, Tile } from "@itwin/itwinui-react";
import IssuesClient, { AttachmentMetadataGet, AuditTrailEntryGet, CommentGetPreferReturnMinimal, IssueDetailsGet, IssueGet } from "./IssuesClient";
import IssuesApi, { LabelWithId } from "./IssuesApi";
import "./Issues.scss";
import { MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";

const thumbnails: Map<string, Blob> = new Map<string, Blob>();

const IssuesWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [contextId, setContextId] = useState<string>();
  const viewport = useActiveViewport();
  /** All issues */
  const allIssues = useRef<IssueGet[]>([]);
  /** The issues currently being displayed */
  const [currentIssues, setCurrentIssues] = useState<IssueGet[]>([]);
  const [previewImages, setPreviewImages] = useState<{ [displayName: string]: Blob }>({});
  /** The pictures / attachments that are associated with the issue */
  const [issueAttachmentMetaData, setIssueAttachmentMetaData] = useState<{ [displayName: string]: AttachmentMetadataGet[] }>({});
  /** The blobs for each issue's attachments */
  const [issueAttachments, setIssueAttachments] = useState<{ [displayName: string]: Blob[] }>({});
  /** The comments associated with each issue */
  const [issueComments, setIssueComments] = useState<{ [displayName: string]: CommentGetPreferReturnMinimal[] }>({});
  /** The audit trail associated with each issue */
  const [issueAuditTrails, setIssueAuditTrails] = useState<{ [displayName: string]: AuditTrailEntryGet[] }>({});
  /** The Issue to display when the user selects, if undefined, none is shown */
  const [currentIssue, setCurrentIssue] = useState<IssueGet>();
  /** The Elements linked to the issue */
  const [currentLinkedElements, setLinkedElements] = useState<LabelWithId[]>();
  /** The active tab when the issue is being shown, -1 for none */
  const [activeTab, setActiveTab] = useState<number>(0);
  /** The State filter. */
  const [stateFilter, setStateFilter] = useState<string>("All");
  /** The type filter. */
  const [typeFilter, setTypeFilter] = useState<string>("All");
  /** The decorator used for displaying issue markers */
  const [issueDecorator] = React.useState<MarkerPinDecorator>(() => {
    const decorator = IssuesApi.setupDecorator();
    IssuesApi.enableDecorations(decorator);
    return decorator;
  });

  /** Initialize Decorator */
  useEffect(() => {
    return () => {
      IssuesApi.disableDecorations(issueDecorator);
    };
  }, [issueDecorator]);

  useEffect(() => {
    if (iModelConnection && contextId !== iModelConnection.contextId) {
      setContextId(iModelConnection.contextId);
    }
  }, [contextId, iModelConnection]);

  /** When iModel is loaded, get issue details */
  useEffect(() => {
    (async () => {
      if (contextId) {
        const type = typeFilter !== "All" ? typeFilter : undefined;
        const state = stateFilter !== "All" ? stateFilter : undefined;
        const issuesResp = await IssuesClient.getProjectIssues(contextId, type, state);

        const oldIssues: IssueGet[] = [];

        const promises = new Array<Promise<IssueDetailsGet | undefined>>();
        issuesResp?.issues?.forEach((issue) => {
          if (issue.id) {
            const found = allIssues.current.find((value) => value.id === issue.id);
            if (found) {
              oldIssues.push(found);
            } else {
              const issueDetails = IssuesClient.getIssueDetails(issue.id);
              promises.push(issueDetails);
            }
          }
        });

        const issueResponses = await Promise.all(promises);
        const iss = issueResponses
          .filter((issue) => issue?.issue !== undefined)
          .map((issue) => issue?.issue as IssueGet);

        const newIssueList = oldIssues.concat(iss);

        setCurrentIssues(newIssueList);
        if (allIssues.current.length === 0)
          allIssues.current = newIssueList;
      }
    })()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, [contextId, stateFilter, typeFilter]);

  /** Set the preview Images on issue load */
  useEffect(() => {
    currentIssues.map(async (issue) => {
      if (issue.id) {
        const metaData = await IssuesClient.getIssueAttachments(issue.id);
        const previewAttachmentId = metaData?.attachments ? metaData.attachments[0]?.id : undefined;
        if (previewAttachmentId !== undefined && !thumbnails.has(previewAttachmentId)) {
          const binaryImage = await IssuesClient.getAttachmentById(issue.id, previewAttachmentId);
          if (binaryImage)
            setPreviewImages((prevState) => ({ ...prevState, [issue.displayName as string]: binaryImage }));
        }

        /** Set the rest of the attachments in the attachmentMetaData */
        if (metaData?.attachments) {
          setIssueAttachmentMetaData((prevState) => ({ ...prevState, [issue.displayName as string]: metaData.attachments!.length > 1 ? metaData.attachments!.slice(1) : [] }));
        }
      }
    });
  }, [currentIssues]);

  const applyView = useCallback(async (issue: IssueGet) => {
    /** apply the camera position if present */
    if (viewport?.view.is3d()) {
      const view3d = viewport.view;
      const cameraView = issue.modelView?.cameraView;
      if (cameraView) {
        const eyePoint = Point3d.fromJSON(cameraView.viewPoint);
        const upVector = Vector3d.fromJSON(cameraView.up);
        const directionVector = Point3d.fromJSON(cameraView.direction);
        const fov = Angle.degreesToRadians(cameraView.fieldOfView!);
        const targetPoint = eyePoint.plus(directionVector);
        view3d.lookAtUsingLensAngle(eyePoint, targetPoint, upVector, Angle.createRadians(fov));
        viewport.synchWithView();
      }
    }
  }, [viewport]);

  /** Create the issue marker icon, then add the pin at the issue location */
  useEffect(() => {
    const parser = new DOMParser();
    const SVGMAP: { [key: string]: HTMLImageElement } = {};
    const issue_marker: string = `
    <svg viewBox="0 0 32 32" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="m25 0h-18a5 5 0 0 0 -5 5v18a5 5 0 0 0 5 5h5v.00177l4 3.99823 4-3.99823v-.00177h5a5 5 0 0 0 5-5v-18a5 5 0 0 0 -5-5z" fill="#fff" fill-rule="evenodd"/>
      <path id="fill" d="m25 1a4.00453 4.00453 0 0 1 4 4v18a4.00453 4.00453 0 0 1 -4 4h-18a4.00453 4.00453 0 0 1 -4-4v-18a4.00453 4.00453 0 0 1 4-4z" fill="#008be1"/>
      <path id="icon" d="m10.8125 5h1.125v18h-1.125zm12.375 6.75h-10.125v-6.75h10.125l-4.5 3.375z" fill="#fff"/>
    </svg>`;

    IssuesApi.clearDecoratorPoints(issueDecorator);

    /** Clear the current points */
    for (const issue of currentIssues) {
      const fillColor = issueStatusColor(issue);
      let svg = SVGMAP[fillColor];
      if (!svg) {
        const imgXml = parser.parseFromString(issue_marker, "application/xml");

        /** set the background fill color */
        const fill = imgXml.getElementById("fill");
        if (fill) {
          fill.setAttribute("fill", fillColor);
        }

        /** set the foreground (icon flag) color */
        const icon = imgXml.getElementById("icon");
        if (icon) {
          const textColor = buildForegroundColor(fillColor);
          if (textColor) {
            icon.setAttribute("fill", textColor);
          }
        }

        const svgString = new XMLSerializer().serializeToString(imgXml);
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        svg = new Image(40, 40);
        svg.src = URL.createObjectURL(blob);
        SVGMAP[fillColor] = svg;
      }

      /** Add the point to the decorator */
      IssuesApi.addDecoratorPoint(issueDecorator, issue, svg, issue.number, issue.subject, (iss: any) => {
        applyView(iss)
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        setActiveTab(0);
        setCurrentIssue(iss);
      });
    }
    /** This timer is being used to resolve an async issue that prevents marker pin decorations from being drawn immeditately after changing the current issues */
    const timer = new Timer(250);
    timer.setOnExecute(() => { if (IModelApp.viewManager) IModelApp.viewManager.invalidateDecorationsAllViews(); });
    timer.start();

  }, [applyView, currentIssues, issueDecorator]);

  /** Returns a color corresponding to the status of the issue */
  const issueStatusColor = (issue: IssueGet) => {
    switch (issue.status) {
      case "Unresolved": /* Orange */
        return "#F18812";
      case "Verified":  /* Blue */
        return "#0088FF";
      case "Resolved": /* Green */
        return "#56A91C";
      default: /* Rejected: Red */
        return "#D30A0A";
    }
  };

  /** Helper to determine text color on the basis of background hex color. */
  const buildForegroundColor = (markerFillColor: string): string | undefined => {
    if (!markerFillColor) return;
    if (markerFillColor[0] === "#") {
      markerFillColor = markerFillColor.slice(1);
    }
    const r = parseInt(markerFillColor.substr(0, 2), 16);
    const g = parseInt(markerFillColor.substr(2, 2), 16);
    const b = parseInt(markerFillColor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // All focus on yellow only
    return yiq >= 190 ? "#000000" : "#FFFFFF";
  };

  const getLinkedElements = useCallback(async () => {
    /** Don't refetch if we have already received the linked elements */
    if (!iModelConnection || currentLinkedElements || !currentIssue)
      return;

    if (!currentIssue.sourceEntity?.iModelElement?.elementId) {
      setLinkedElements([]);
      return;
    }

    const elementKeySet = await IssuesApi.getElementKeySet(currentIssue.sourceEntity?.iModelElement?.elementId);
    const elementInfo = await IssuesApi.getElementInfo(iModelConnection, elementKeySet);
    setLinkedElements(elementInfo);
  }, [currentIssue, currentLinkedElements, iModelConnection]);

  /** call the client to get the issue attachments */
  const getIssueAttachments = useCallback(async () => {
    /** If the attachments have already been retrieved don't refetch*/
    if (!currentIssue || (currentIssue.displayName && issueAttachments[currentIssue.displayName]))
      return;

    /** Grab the attachments */
    const metaData = issueAttachmentMetaData[currentIssue.displayName!];
    metaData?.forEach(async (attachment) => {
      const image = await IssuesClient.getAttachmentById(currentIssue.id!, attachment.id!);
      if (image)
        setIssueAttachments((prevState) => ({ ...prevState, [currentIssue.displayName as string]: currentIssue.displayName! in prevState ? [...prevState[currentIssue.displayName!], image] : [image] }));
    });
  }, [currentIssue, issueAttachmentMetaData, issueAttachments]);

  /** call the client to get the issue comments */
  const getIssueComments = useCallback(async () => {
    /** If the comments have already been retrieved don't refetch*/
    if (!currentIssue || (currentIssue.displayName && issueComments[currentIssue.displayName]))
      return;

    /** Grab the comments */
    const commentsResponse = await IssuesClient.getIssueComments(currentIssue.id!);
    const comments = commentsResponse?.comments ? commentsResponse?.comments : [];

    /** Set the comments */
    setIssueComments((prevState) => ({ ...prevState, [currentIssue.displayName as string]: comments }));
  }, [currentIssue, issueComments]);

  /** call the client to get the issue Audit trail */
  const getIssueAuditTrail = useCallback(async () => {
    /** If the comments have already been retrieved don't refetch*/
    if (!currentIssue || (currentIssue.displayName && issueAuditTrails[currentIssue.displayName]))
      return;

    /** Grab the comments */
    const auditResponse = await IssuesClient.getIssueAuditTrail(currentIssue.id!);
    const auditTrail = auditResponse?.auditTrailEntries ? auditResponse.auditTrailEntries : [];

    /** Set the audit trail for the currentIssue */
    setIssueAuditTrails((prevState) => ({ ...prevState, [currentIssue.displayName as string]: auditTrail }));
  }, [currentIssue, issueAuditTrails]);

  /** Make the client request when the tab for the issue is selected. */
  useEffect(() => {
    switch (activeTab) {
      case 0:
        getLinkedElements()
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        break;
      /** Attachments tab */
      case 1:
        getIssueAttachments()
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        break;
      /** Audit trail tab */
      case 2:
        getIssueComments()
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        getIssueAuditTrail()
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        break;
    }
  }, [activeTab, getIssueAttachments, getIssueAuditTrail, getIssueComments, getLinkedElements]);

  const issueSummaryContent = () => {
    const columns = [{
      Header: "Table",
      columns: [
        { id: "properties", Header: "Properties", accessor: "prop" },
        { id: "value", Header: "Value", accessor: "val" },
      ],
    }];
    const data = [
      { prop: "Id", val: currentIssue?.id },
      { prop: "Subject", val: currentIssue?.subject },
      { prop: "Status", val: currentIssue?.status },
      { prop: "State", val: currentIssue?.state },
      { prop: "Assignee", val: currentIssue?.assignee?.displayName },
      { prop: "Due Date", val: currentIssue?.dueDate },
      { prop: "Description", val: currentIssue?.description },
      { prop: "Created Date", val: currentIssue?.createdDateTime },
      { prop: "Created By", val: currentIssue?.createdBy },
      { prop: "Assignees", val: currentIssue?.assignees?.reduce((currentString, nextAssignee) => `${currentString} ${nextAssignee.displayName},`, "").slice(0, -1) },
    ];
    return (<Table className={"table"} columns={columns} data={data} emptyTableContent='No data.'></Table>);
  };

  const issueLinkedElements = () => {
    if (!iModelConnection || !currentLinkedElements)
      return <></>;

    return (
      <div className={"issue-linked-container"}>
        <Subheading className={"issue-linked-title"}>{`Linked Elements`}</Subheading>
        {currentLinkedElements.map((label) => {
          return (<div key={label.id} className={"issue-linked-element"} onClick={() => viewport?.zoomToElements(label.id)}>
            <div className={"icon icon-item"}></div>
            <div className={"issues-linked-element-label"}>{label.displayValue}</div>
          </div>);
        })}
      </div>
    );
  };

  const issueAttachmentsContent = React.useCallback(() => {
    /** grab the comment for the current issue */
    const attachments = issueAttachments[currentIssue!.displayName!];
    const metaData = issueAttachmentMetaData[currentIssue!.displayName!];

    if (metaData.length === 0)
      return (<Body style={{ color: "#fff" }}>No attachments.</Body>);
    else if (attachments === undefined)
      return (<div style={{ display: "flex", placeContent: "center" }}><Spinner /></div>);

    /** Loop through the dates and put them together in chunks */
    return attachments.map((attachment, index) => {
      const urlObj = URL.createObjectURL(attachment);
      return (
        <Tile
          key={`${currentIssue?.displayName}_Comments_${index}`}
          style={{ marginTop: "5px", marginBottom: "5px" }}
          name={metaData[index].fileName}
          description={metaData[index].caption}
          thumbnail={<a href={urlObj} className="thumbnail" download={metaData[index].fileName} style={{ backgroundImage: `url(${urlObj})` }} />}
        />
      );
    });
  }, [issueAttachments, issueAttachmentMetaData, currentIssue]);

  const getColorByAction = (action: string | undefined) => {
    if (undefined === action)
      return "";

    switch (action) {
      case ("Created"): return "#4585a5";
      case ("Closed"): return "#f7706c";
      case ("Opened"): return "#b1c854";
      case ("File Attached"): return "#73c7c1";
      case ("File Removed"): return "#f7963e";
      case ("Modified"): return "#6ab9ec";
      case ("Assigned"): return "#ffc335";
      case ("Status"): return "#a3779f";
      case ("Form Raised"): return "#84a9cf";
      default: return "#c8c2b4";
    }
  };

  const getLabel = (auditTrail: AuditTrailEntryGet): JSX.Element => {
    let actionText: JSX.Element = (<></>);
    switch (auditTrail.action) {
      case "Created":
        actionText = (<span>by&nbsp;{auditTrail.changeBy}</span>);
        break;
      case "Modified":
        actionText = (<span>by&nbsp;{auditTrail.changeBy}</span>);
        break;
      case "Assigned":
        actionText = (<span>to {auditTrail.changes![0].newValue}</span>);
        break;
      case "Status":
        actionText = (<span>set to {auditTrail.changes![0].newValue}</span>);
        break;
      case "Opened":
        actionText = (<span>by&nbsp;{auditTrail.changeBy}</span>);
        break;
      case "File Attached":
        actionText = (<span>&quot;{auditTrail.changes![0].newValue?.substring(0, 25)}{auditTrail.changes![0].newValue!.length > 25 ? "..." : ""}&quot;</span>);
        break;
    }
    return (<><span className="issue-audit-label">&nbsp;{auditTrail.action}&nbsp;</span>{actionText}</>);
  };

  const issueAuditTrailContent = () => {
    /** grab the comment for the current issue */
    const comments = issueComments[currentIssue!.displayName!];

    /** grab the audit trail for the current issue */
    const auditTrail = issueAuditTrails[currentIssue!.displayName!];

    if (comments === undefined || auditTrail === undefined)
      return (<div style={{ display: "flex", placeContent: "center" }}><Spinner /></div>);
    else if (comments.length === 0 && auditTrail.length === 0)
      return (<Body style={{ color: "fff" }}>No content.</Body>);

    /** separate audit trail by day */
    const combinedByDay: { [day: string]: JSX.Element[] } = {};
    auditTrail.sort((a, b) => new Date(a.changeDateTime!).getTime() - new Date(b.changeDateTime!).getTime());
    auditTrail.forEach((trail) => {
      const date = new Date(trail.changeDateTime!).toDateString();
      if (!combinedByDay[date]) {
        combinedByDay[date] = [];
      }
      const jsxAudit = (
        <div className="issue-audit-container">
          <div className="issue-audit-content">
            <div className="issue-audit-bubble" style={{ backgroundColor: getColorByAction(trail.action) }} />
            {getLabel(trail)}
          </div>
        </div>
      );
      combinedByDay[date].push(jsxAudit);
    });

    /** Add the comments into the byDay dict */
    comments.forEach((comment) => {
      const date = new Date(comment.createdDateTime!).toDateString();
      if (!combinedByDay[date]) {
        combinedByDay[date] = [];
      }
      const jsxComment = (
        <div className="comment-container">
          <div className="comment-header">
            <span>{comment.authorDisplayName}</span>
          </div>
          <div className="comment-content">
            <span className="comment-text">{comment.text}</span>
          </div>
        </div>
      );
      combinedByDay[date].push(jsxComment);
    });

    /** Get the dates in order */
    const combinedByDayOrdered = Object.keys(combinedByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    /** Loop through the dates and put them together in chunks */
    return combinedByDayOrdered.map((date) => (
      <div key={date.toString()} className="date-group">
        <div className="date">
          <span>{date}</span>
        </div>
        {combinedByDay[date]}
      </div>
    ));
  };

  const filterTypes = ["All", "Clash", "Closeout", "Data Quality", "Field Data"];

  return (
    <>
      <div className={"issues-widget"} style={{ height: "300px" }}>
        {/** Only display header when issue isn't selected */}
        {!currentIssue &&
          <div className="issue-list-header">
            <Subheading style={{ margin: "0", padding: "8px 5px", color: "#fff" }}>{`Issues (${currentIssues.length})`}</Subheading>
            <div className="issue-list-filters">
              <div className="filter">
                <span>State</span>
                <Select options={["All", "Closed", "Open", "Draft"]} value={stateFilter} onChange={(option) => setStateFilter(option.target.selectedOptions[0].value)} />
              </div>
              <div className="filter">
                <span>Type</span>
                <Select options={filterTypes} value={typeFilter} onChange={(option) => setTypeFilter(option.target.selectedOptions[0].value)} />
              </div>
            </div>
          </div>}

        {/** When the issues haven't loaded yet, display spinner */}
        {allIssues.current.length === 0 &&
          <Spinner size={SpinnerSize.Medium} />
        }

        {/** When there are no issues retrieved from filter. */}
        {allIssues.current.length !== 0 && currentIssues.length === 0 && <span style={{ color: "#fff", padding: "4px" }}>No Content.</span>}

        {/** When the issues are loaded, display them in a list */}
        {!currentIssue && currentIssues && Object.keys(previewImages).length > 0 && currentIssues.length > 0 &&
          <div>
            {currentIssues.map((issue: IssueGet) => {
              const createdDate = issue.createdDateTime ? new Date(issue.createdDateTime).toLocaleDateString() : undefined;
              const binaryUrl = issue.displayName && previewImages[issue.displayName] ? URL.createObjectURL(previewImages[issue.displayName]) : undefined;
              const imageStyle = binaryUrl ? { backgroundImage: `url(${binaryUrl})` } : {};
              return (
                <div key={issue.id} className="issue">
                  <div className="issue-preview">
                    {issue.modelView &&
                      <div className="thumbnail" style={imageStyle} onClick={async () => applyView(issue)}>
                        <span className="open icon icon-zoom" title={"Locate & Zoom"} />
                      </div>
                    }
                    <div className="issue-status" style={{ borderTop: `14px solid ${issueStatusColor(issue)}`, borderLeft: `14px solid transparent` }} />
                  </div>
                  <div className="issue-info" onClick={() => { setCurrentIssue(issue); setActiveTab(0); }}>
                    <Leading className={"issue-title"}>{`${issue.number} | ${issue.subject}`}</Leading>
                    <div className="issue-subtitle">
                      <span className={"assignee-display-name"}>{issue.assignee?.displayName}</span>
                      <div className={"created-date"}>
                        <span>{createdDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        }

        {/** When an issue is selected from the initial list, show the tab interface */}
        {currentIssue &&
          <div className={"issue-details"}>
            <div className={"header"}>
              <IconButton styleType='borderless' size='small' className="back-button" onClick={() => { setCurrentIssue(undefined); setLinkedElements(undefined); }}><span className="icon icon-chevron-left" style={{ color: "white" }}></span></IconButton>
              <Subheading style={{ margin: "0", padding: "8px 5px", color: "#fff" }}>{`${currentIssue.number} | ${currentIssue.subject}`}</Subheading>
            </div>

            <HorizontalTabs type='default' labels={["Summary", "Attachments", "Audit Trail"]} activeIndex={activeTab} onActivateTab={(index) => setActiveTab(index)} />
            <div className={"issue-tab-content"}>
              {activeTab === 0 &&
                <div className={"issue-summary"}>
                  {issueSummaryContent()}
                  {issueLinkedElements()}
                </div>
              }
              {activeTab === 1 &&
                <div className={"issue-attachments"}>
                  {issueAttachmentsContent()}
                </div>
              }
              {activeTab === 2 &&
                <div className={"issue-audit-trail"}>
                  {issueAuditTrailContent()}
                </div>
              }
            </div>
          </div>
        }
      </div>
    </>
  );
};

export class IssuesWidgetProvider implements UiItemsProvider {
  public readonly id: string = "IssuesWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "IssuesWidget",
          label: "Issue Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <IssuesWidget />,
        }
      );
    }
    return widgets;
  }
}
