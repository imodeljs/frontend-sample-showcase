/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { OpenMode } from "@bentley/bentleyjs-core";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelQuery } from "@bentley/imodelhub-client";
import { AuthorizedFrontendRequestContext, FrontendRequestContext, IModelApp, IModelConnection, RemoteBriefcaseConnection } from "@bentley/imodeljs-frontend";
import { SignIn } from "@bentley/ui-components";
import { SampleBaseApp } from "../../SampleBaseApp";
import { LoadingSpinner, SpinnerSize } from "@bentley/ui-core";

/** React state of the StartupComponent */
export interface StartupProps {
  iModelName: string;
  iModelName2?: string;
  onIModelReady(iModel: IModelConnection): void;
}

/** React state of the StartupComponent */
export interface StartupState {
  user: {
    isAuthorized: boolean;
    isLoading?: boolean;
  };
  imodel?: IModelConnection;
}

/** A component that renders the open IModel button and handles the signin logic */
export class StartupComponent extends React.Component<StartupProps, StartupState> {

  /** Creates an StartupComponent instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      user: {
        isLoading: false,
        isAuthorized: false,
      },
    };
  }

  public componentDidMount() {
    // Initialize authorization state, and add listener to changes
    SampleBaseApp.oidcClient.onUserStateChanged.addListener(this._onUserStateChanged);
    if (SampleBaseApp.oidcClient.isAuthorized)
      this.setState((prev) => ({ user: { ...prev.user, isLoading: false, isAuthorized: true } }));
  }

  public componentWillUnmount() {
    // unsubscribe from user state changes
    SampleBaseApp.oidcClient.onUserStateChanged.removeListener(this._onUserStateChanged);
  }

  public componentDidUpdate(_prevProps: {}, prevState: StartupState) {
    // When the user.authorized goes from false to true, try to open the iModel.
    if (!prevState.user.isAuthorized && this.state.user.isAuthorized) {
      this.openIModel()
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }

    // When the iModel goes from invalid to valid, send the notification
    if (!prevState.imodel && this.state.imodel) {
      this.props.onIModelReady(this.state.imodel);
    }
  }

  private _onStartSignin = async () => {
    this.setState((prev) => ({ user: { ...prev.user, isLoading: true } }));
    await SampleBaseApp.oidcClient.signIn(new FrontendRequestContext());
  };

  private _onUserStateChanged = () => {
    this.setState((prev) => ({ user: { ...prev.user, isLoading: false, isAuthorized: SampleBaseApp.oidcClient.isAuthorized } }));
  };

  private async getIModelInfo(): Promise<{ projectId: string, imodelId: string }> {
    const requestContext: AuthorizedFrontendRequestContext = await AuthorizedFrontendRequestContext.create();

    // In testdrive the projectName matches iModelName.  That's not true in general.
    let iModelName = this.props.iModelName;
    const projectName = this.props.iModelName;

    if (this.props.iModelName2) {
      iModelName = this.props.iModelName2;
    }

    // const connectClient = new ConnectClient();
    const connectClient = new ContextRegistryClient();
    let project: Project;
    try {
      project = await connectClient.getProject(requestContext, { $filter: `Name+eq+'${projectName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(iModelName);
    const imodels = await IModelApp.iModelClient.iModels.get(requestContext, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);
    return { projectId: project.wsgId, imodelId: imodels[0].wsgId };
  }

  private async openIModel() {
    let imodel: IModelConnection | undefined;
    try {
      // attempt to open the imodel
      const info = await this.getIModelInfo();
      imodel = await RemoteBriefcaseConnection.open(info.projectId, info.imodelId, OpenMode.Readonly);
    } catch (e) {
      alert(e.message);
    }

    this.setState({ imodel });
  }

  /** The component's render method */
  public render() {
    let ui: React.ReactNode;

    if (this.state.user.isLoading) {
      // if user is currently being loaded, just tell that
      ui = `signing-in...`;
    } else if (!this.state.user.isAuthorized) {
      // if user doesn't have an access token, show sign in page
      ui = (<SignIn onSignIn={this._onStartSignin} />);
    } else if (!this.state.imodel) {
      // if we don't have an imodel yet - render a spinner while we are waiting
      ui = (<LoadingSpinner size={SpinnerSize.XLarge} />);
    } else {
      // if we do have an imodel and view definition id - startup is finished - nothing to do
    }

    // render the StartupComponent
    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        {ui}
      </div >
    );
  }
}
