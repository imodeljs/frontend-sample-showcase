import { ViewQueryParams } from "@bentley/imodeljs-common";
import { IModelConnection, IModelApp } from "@bentley/imodeljs-frontend";
import * as React from "react";

export interface ViewSelectorProps {
  queryParams: ViewQueryParams;
  imodel?: IModelConnection;
}
export interface ViewSelectorState {
  viewList: IModelConnection.ViewSpec[];
  activeViewId?: string;
  isUpdating: boolean;
}
export class ShowcaseViewSelector extends React.Component<ViewSelectorProps, ViewSelectorState> {

  private _subscriptions: Array<() => void> = [];

  constructor(props: ViewSelectorProps) {
    super(props);
    this.state = {
      viewList: [],
      activeViewId: undefined,
      isUpdating: false,
    };
  }

  public componentDidMount() {
    this._subscriptions.push(IModelApp.viewManager.onViewOpen.addListener(this.updateActiveViewId.bind(this)));
    this._subscriptions.push(IModelApp.viewManager.onViewOpen.addListener(this.updateViewList.bind(this)));
  }

  public componentWillUnmount() {
    this._subscriptions.forEach((callback) => callback());
  }

  private updateActiveViewId() {
    const activeViewId = IModelApp.viewManager.selectedView?.view.id;
    this.setState({ activeViewId });
  }

  private updateViewList() {
    this.setState({ isUpdating: true });
    this.props.imodel?.views.getViewList(this.props.queryParams)
      .then((viewList) => this.setState({ viewList }))
      .catch()
      .finally(() => this.setState({ isUpdating: false }));
  }

  public componentDidUpdate(prevProps: ViewSelectorProps, _prevState: ViewSelectorState) {
    if (prevProps.imodel !== this.props.imodel) {
      this.updateViewList();
      if (this.state.activeViewId === undefined)
        this.updateActiveViewId();
    }
  }

  public getSelector(activeViewId: string, viewList: IModelConnection.ViewSpec[]) {
    return <select value={activeViewId}
      disabled={this.state.isUpdating}
      onChange={async (event) => {
        const iModel = IModelApp.viewManager.selectedView!.iModel;
        const state = await iModel.views.load(event.target.value);
        IModelApp.viewManager.selectedView?.changeView(state);
    }
    }>
      {viewList.map((viewSpec, index) =>
        <option key={index} value={viewSpec.id}>{viewSpec.name}</option>)
      }
    </select>;
  }

  public render() {
    return (
      <div>
        {undefined !== this.state.activeViewId && this.state.viewList.length > 0 ?
          this.getSelector(this.state.activeViewId!, this.state.viewList) : <></>
        }
      </div>
    );
  }
}
