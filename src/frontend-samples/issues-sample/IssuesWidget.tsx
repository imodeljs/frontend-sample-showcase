import * as React from "react";
import { useState } from "react";
import { I18N } from "@bentley/imodeljs-i18n";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import { CommonProps, Spinner } from "@bentley/ui-core";
import { getCenteredViewRect, imageBufferToBase64EncodedPng, imageElementFromUrl, IModelApp, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { AttachmentMetadataCreate, AttachmentMetadataGet, CommentGetPreferReturnMinimal, ErrorResponse, HttpResponse, IssueGet, IssuesClient, RequestParams } from "./clients/IssuesClient"
import { Angle, Point2d, Point3d, Vector3d } from "@bentley/geometry-core";
import { ImageBuffer } from "@bentley/imodeljs-common";
import { HorizontalTabs, IconButton, Subheading, Table, Tile, Title } from "@itwin/itwinui-react";
import { SvgProgressBackward } from "@itwin/itwinui-icons-react";
import IssuesApi from "./IssuesApi"
import "./Issues.scss";
import "./IssueList.scss";

/**
 * The provider that will be registered
 */
export class IssuesProvider implements UiItemsProvider {
    public readonly id = "1898UiProvider";
    public static i18n: I18N;
    private readonly contextId: string;
    private issuesClient: IssuesClient<undefined>;

    public constructor(contextId: string) {
        this.contextId = contextId;
        this.issuesClient = new IssuesClient();
    }

    public provideWidgets(stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {
        const widgets: AbstractWidgetProps[] = [];
        if (stageId === "DefaultFrontstage" && location === StagePanelLocation.Right) {
            widgets.push({
                id: "issuesWidget",
                getWidgetContent: () => <IssuesWidget projectId={this.contextId} issuesClient={this.issuesClient} />,
                label: "Issues",
            });
        }
        return widgets;
    }
}

interface IssuesWidgetProps extends CommonProps {
    projectId: string;
    issuesClient: IssuesClient<undefined>;
}

let thumbnails: Map<string, Blob> = new Map<string, Blob>();

const IssuesWidget: React.FC<IssuesWidgetProps> = (props: IssuesWidgetProps) => {
    const [issues, setIssues] = useState<IssueGet[]>([]);
    const [previewImages, setPreviewImages] = useState<{ [displayName: string]: Blob }>({});

    /** The pictures / attachments that are associated with the issue */
    const [issueAttachmentMetaData, setIssueAttachmentMetaData] = useState<{ [displayName: string]: AttachmentMetadataGet[] }>({});
    const [issueAttachments, setIssueAttachments] = useState<{ [displayName: string]: Blob[] }>({});

    /** The comments associated with each issue */
    const [issueComments, setIssueComments] = useState<{ [displayName: string]: CommentGetPreferReturnMinimal[] }>({});

    /** The Issue to display when the user selects, if undefined, none is shown */
    const [currentIssue, setCurrentIssue] = useState<IssueGet>();

    /** The active tab when the issue is being shown */
    const [activeTab, setActiveTab] = useState<number>(0);

    /** Initalize Decorator */
    React.useEffect(() => {
        IssuesApi.setupDecorator();
        IssuesApi.enableDecorations();

        return () => {
            IssuesApi.disableDecorations();
            IssuesApi._issuesPinDecorator = undefined;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const fetchData = async () => {
            if (issues && issues.length === 0) {
                const issuesResp = await props.issuesClient.getProjectIssues({ projectId: props.projectId });

                const promises = new Array<Promise<any>>();

                issuesResp.data.issues?.forEach(issue => {
                    if (issue.id) {
                        const issueDetails = props.issuesClient.id.getIssueDetails(issue.id);
                        promises.push(issueDetails);
                    }
                })

                const issueResponses = await Promise.all(promises);
                const iss = issueResponses
                    .filter(iss => iss.data?.issue !== undefined)
                    .map(issue => issue.data.issue as IssueGet);

                setIssues(iss);
            }
        }
        fetchData();
    }, []);

    /** Set the Images for when the issues changes */
    React.useEffect(() => {
        issues.map(async (issue) => {
            if (issue.id) {
                const metaData = await props.issuesClient.id.getIssueAttachments(issue.id);
                const previewAttachmentId = metaData.data.attachments ? metaData.data.attachments[0]?.id : undefined;
                if (previewAttachmentId !== undefined && !thumbnails.has(previewAttachmentId)) {
                    const attachmentResp = await props.issuesClient.id.getAttachmentById(issue.id, previewAttachmentId);
                    const binaryImage = attachmentResp.data as unknown as Blob;
                    setPreviewImages(prevState => ({
                        ...prevState,
                        [issue.displayName as string]: binaryImage
                    }));
                }
                if (metaData.data.attachments && metaData.data.attachments.length > 1) {
                    setIssueAttachmentMetaData(prevState => ({
                        ...prevState,
                        [issue.displayName as string]: metaData.data.attachments!.slice(1)
                    }));
                }
            }
        });
    }, [issues]);

    React.useEffect(() => {
        if(issues.length === 0)
            return;
        const parser = new DOMParser();
        const SVGMAP: { [key: string]: HTMLImageElement; } = {};
        for (const issue of issues) {
            const fillColor = issue.properties._StatusColor;
      
            let svg = SVGMAP[fillColor];
            if (!svg) {
              const imgXml = parser.parseFromString(IssuesApi.issue_marker, "application/xml");

              // set the background fill color
              const fill = imgXml.getElementById("fill");
              if (fill) {
                fill.setAttribute("fill", fillColor);
              }
      
              // set the foreground (icon flag) color
              const icon = imgXml.getElementById("icon");
              if (icon) {
                const textColor = IssuesApi.buildForegroundColor(fillColor);
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
            /**TODO: Add description and Title to the marker pin. */
            IssuesApi.addDecoratorPoint(issue.modelPin?.location ?? Point3d.createZero(), svg);
          }
    }, [issues])

    /** React hook for each tab on the issue details screen */
    React.useEffect(() => {
        switch (activeTab) {
            /** Attachments tab */
            case 1:
                getIssueAttachments();
                break;
            /** comments tab */
            case 2:
                getIssueComments();
                break;
        }

    }, [activeTab]);

    /**
     * Creates an attachment on the selected widget and uploads a screenshot of the viewport to the created attachment.
     * In practice, MarkupApp would be started, run, and the result of MarkupApp.stop() is what would be uploaded.
     * @param e 
     */
    const uploadScreenshot = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const id = e.currentTarget.id;
        const params: AttachmentMetadataCreate & RequestParams = {
            fileName: "DesignReview_Markup.png", // This needs to be the name of the file for DesignReview to list it in its issues pane
            caption: "From markup example app.",
        }

        // Create attachment and get attachmentId 
        const resp: HttpResponse<void, ErrorResponse | void> = await props.issuesClient.id.addAttachmentToIssue(id, params);

        // Get attachmentId from response.headers.location
        const uploadURL: string | null = resp.headers.get("location");
        const match: RegExpMatchArray | null = uploadURL!.match(/\/attachments\/(.*)/);
        if (match && match.length >= 2) {
            // Get screenshot
            const viewPort: Viewport = IModelApp.viewManager.selectedView!;
            const img: ImageBuffer | undefined = viewPort.readImage(getCenteredViewRect(viewPort.viewRect), new Point2d(846, 600), true);
            if (img) {
                const thumbnail = imageBufferToBase64EncodedPng(img);
                const image: string = `data:image/png;base64,${thumbnail}`;
                const attachmentId: string = match[1];

                // Upload the base64EncodedPng to Issue and Attachment Id
                await props.issuesClient.id.uploadAttachmentFile(id, attachmentId, image);
            }
        }
    }

    const applyView = async (issue: IssueGet) => {
        const vp = IModelApp.viewManager.selectedView;
        if (!vp)
            return;

        // apply the camera position if present
        const view = vp.view;
        if (view.is3d()) {
            const view3d = view as ViewState3d;
            const cameraView = issue.modelView?.cameraView;
            if (cameraView) {
                const eyePoint = Point3d.fromJSON(cameraView.viewPoint);
                const upVector = Vector3d.fromJSON(cameraView.up);
                const directionVector = Point3d.fromJSON(cameraView.direction);
                const fov = Angle.degreesToRadians(cameraView.fieldOfView!);
                const targetPoint = eyePoint.plus(directionVector);
                view3d.lookAtUsingLensAngle(eyePoint, targetPoint, upVector, Angle.createRadians(fov));
                vp.synchWithView();
            }
        }
    }


    const getIssueAttachments = async () => {
        /** If the attachments have already been retrieved don't refetch*/
        if (!currentIssue || (currentIssue.displayName && issueAttachments[currentIssue.displayName]))
            return;

        /** Grab the attachments */
        const metaData = issueAttachmentMetaData[currentIssue.displayName!];
        metaData?.forEach(async (attachment) => {
            const attachmentResp = await props.issuesClient.id.getAttachmentById(currentIssue.id!, attachment.id!);
            const image = attachmentResp.data as unknown as Blob;
            setIssueAttachments(prevState => ({
                ...prevState,
                [currentIssue.displayName as string]: currentIssue.displayName! in prevState ? [...prevState[currentIssue.displayName!], image] : [image]
            }));
        })
    }

    const getIssueComments = async () => {
        /** If the comments have already been retrieved don't refetch*/
        if (!currentIssue || (currentIssue.displayName && issueComments[currentIssue.displayName]))
            return;

        /** Grab the comments */
        const commentsResponse = await props.issuesClient.id.getIssueComments(currentIssue.id!);
        const comments = commentsResponse.data.comments ? commentsResponse.data.comments : [];

        /** Set the comments */
        setIssueComments(prevState => ({
            ...prevState,
            [currentIssue.displayName as string]: comments
        }));
    }

    const issueSummaryContent = () => {
        const columns = [{
            Header: 'Table',
            columns: [{
                id: 'properties',
                Header: 'Properties',
                accessor: 'prop',
            },
            {
                id: 'value',
                Header: 'Value',
                accessor: 'val'
            }],
        }];

        const data = [
            { prop: 'id', val: currentIssue?.id },
            { prop: 'subject', val: currentIssue?.subject },
            { prop: 'status', val: currentIssue?.status },
            { prop: 'state', val: currentIssue?.state },
            { prop: 'assignee', val: currentIssue?.assignee?.displayName },
            { prop: 'dueDate', val: currentIssue?.dueDate },
            { prop: 'description', val: currentIssue?.description },
            { prop: 'createdDateTime', val: currentIssue?.createdDateTime },
            { prop: 'createdBy', val: currentIssue?.createdBy },
            { prop: 'assignees', val: currentIssue?.assignees?.reduce((currentString, nextAssignee) => `${currentString} ${nextAssignee.displayName},`, '').slice(0, -1) },
        ];
        return (<Table columns={columns} data={data} style={{ padding: '0' }} emptyTableContent='No data.'></Table>);
    }

    const issueAttachmentsContent = React.useCallback(() => {
        /** grab the commesnt for the current issue */
        const attachments = issueAttachments[currentIssue?.displayName!];
        const metaData = issueAttachmentMetaData[currentIssue?.displayName!];

        if (attachments === undefined)
            return <Spinner />
        else if (attachments.length == 0)
            return "No Attachments";

            const val = attachments.map((attachment, index) => (
                <Tile
                    name={metaData[index].caption}
                    thumbnail={URL.createObjectURL(attachment)}
                />
            ));

        /** Loop through the dates and put them together in chunks */
        return attachments.map((attachment, index) => (
            <Tile
                style={{marginTop: '5px', marginBottom: '5px'}}
                name={metaData[index].caption}
                thumbnail={URL.createObjectURL(attachment)}
            />
        ));
    }, [issueAttachments, issueAttachmentMetaData, currentIssue]);

    const issueCommentsContent = () => {
        /** grab the commesnt for the current issue */
        const comments = issueComments[currentIssue?.displayName!];

        if (comments === undefined)
            return <Spinner />
        else if (comments.length == 0)
            return "No Comments";

        /** seperate the comments by day */
        const commentsByDay: { [day: string]: CommentGetPreferReturnMinimal[] } = {}
        comments.forEach(comment => {
            const date = new Date(comment.createdDateTime!).toDateString();
            if (!commentsByDay[date]) {
                commentsByDay[date] = [];
            }
            commentsByDay[date].push(comment);
        });

        /** Get the dates in order */
        const dateInOrder = Object.keys(commentsByDay).sort();

        /** Loop through the dates and put them together in chunks */
        return dateInOrder.map(date => (
            <div className="comment-group">
                <div className="comment-date">
                    <span>{date}</span>
                </div>
                {commentsByDay[date].map((comment) => (
                    <div className="comment-container">
                        <div className="comment-header">
                            <span>{comment.authorDisplayName}</span>
                        </div>
                        <div className="comment-content">
                            <span className="comment-text">{comment.text}</span>
                        </div>
                    </div>
                ))}
            </div>
        ));
    }

    return (
        <>
            <div>
                {!currentIssue && issues && Object.keys(previewImages).length > 0 && issues.length > 0 &&
                    <div>
                        <Subheading style={{ margin: '0', padding: '8px 5px' }}>{`Issues (${issues.length})`}</Subheading>
                        {issues.map((issue: IssueGet) => {
                            const showOpen = true;
                            const showSpinner = false;
                            const ready = true;
                            const createdDate = issue.createdDateTime ? new Date(issue.createdDateTime).toLocaleDateString() : undefined;
                            const binaryUrl = issue.displayName && previewImages[issue.displayName] ? URL.createObjectURL(previewImages[issue.displayName]) : undefined;
                            const imageStyle = binaryUrl ? { backgroundImage: `url(${binaryUrl})` } : {};

                            return (
                                <div className="issue">
                                    <div className="issue-preview">
                                        {issue.modelView &&
                                            <div className="thumbnail" style={imageStyle} onClick={() => applyView(issue)}>
                                                {(!ready && showSpinner) && <div className="spinner"> <Spinner /> </div>}
                                                {showOpen && <span className="open icon icon-zoom" title={"Locate & Zoom"} />}
                                            </div>
                                        }
                                        {issue.properties._StatusColor && <div className="issue-status" style={{ borderTop: `14px solid ${issue.properties._StatusColor}`, borderLeft: `14px solid transparent` }} />}
                                    </div>
                                    <div className="issue-info" onClick={() => setCurrentIssue(issue)}>
                                        <span className="issue-title">{`${issue.displayName} | ${issue.subject}`}</span>
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

                {currentIssue &&
                    <div className={"issue-details"}>
                        <div className={"header"}>
                            <IconButton styleType='borderless' size='small' onClick={() => setCurrentIssue(undefined)}><SvgProgressBackward /></IconButton>
                            <Subheading style={{ margin: '0' }}>{`${currentIssue.displayName} | ${currentIssue.subject}`}</Subheading>
                        </div>

                        <HorizontalTabs type='default' labels={["Summary", "Attachments", "Comments"]} activeIndex={activeTab} onTabSelected={(index: number) => setActiveTab(index)}>
                            <div className={"issue-tab-content"}>
                                {activeTab === 0 &&
                                    <div className={"issue-summary"}>
                                        {issueSummaryContent()}
                                    </div>
                                }
                                {activeTab === 1 &&
                                    <div className={"issue-attachments"}>
                                        {issueAttachmentsContent()}
                                    </div>
                                }
                                {activeTab === 2 &&
                                    <div className={"issue-comments"}>
                                        {issueCommentsContent()}
                                    </div>
                                }
                            </div>
                        </HorizontalTabs>
                    </div>
                }
            </div>
        </>
    );
}

