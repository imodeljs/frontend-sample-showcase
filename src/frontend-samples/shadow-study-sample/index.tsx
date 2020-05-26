/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../Components/GithubLink";
import "../../common/samples-common.scss";
import { IModelConnection, ViewState, IModelApp} from "@bentley/imodeljs-frontend";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { ViewSetup } from "../../api/viewSetup";



export function getShadowStudySpec(): SampleSpec {
  return ({
    name: "shadow-study-sample",
    label: "Shadow Study",
    image: "shadow-study-thumbnail.png",

    setup: ShadowStudyApp.setup,
  });
}

class ShadowStudyApp {

  public static async setup(iModelName: string) {
    const vp = IModelApp.viewManager.selectedView;

    //Enable shadows for the current view
    if (vp && vp.view.is3d()) {
      const viewFlags = vp.viewFlags.clone()
      viewFlags.shadows = true
      vp.viewFlags = viewFlags
      vp.synchWithView()
    }

    return <ShadowStudyUI iModelName = {iModelName} />;
  }

  //Updates the sun time for the current model
  public static updateSunTime(time: number) {
    const vp = IModelApp.viewManager.selectedView;

    if (vp && vp.view.is3d()) {
      const displayStyle = vp.view.getDisplayStyle3d()
      displayStyle.setSunTime(time)
      vp.displayStyle = displayStyle
      vp.synchWithView()
    }
  }
}

/** React state of the Sample component */
interface ShadowStudyState {
  date: Date
}

/** A React component that renders the UI specific for this sample */

export class ShadowStudyUI extends React.Component<{iModelName: string}, ShadowStudyState> {

  /** Creates an Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context)

    //Get date object for current time of day
    const today = new Date()
  
    this.state = {
      date: today
    };

    //Initialize sun time to current time
    ShadowStudyApp.updateSunTime(today.getTime()) 


  }

  //Update the date state with the newly selected minute of the day
  private updateTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    var date = this.state.date
    
    //Time slider represents time of day as a number from 0-1439, one for each minute of the day
    //So we need to modulo by 60 to get the min of the hour
    //And we need to divide by 60, rounded down, to get the hour of the day
    date.setMinutes(Number(event.target.value)%60)
    date.setHours(Math.floor(Number(event.target.value)/60))

    //Unlike updateDate, no need to verify a valid time input, since slider doesn't allow for direct user input
    //So we can safely update the state, time label, and sun time

    this.setState({ date: date });

    var dateLabel = document.getElementById('time')
    if (dateLabel)
      dateLabel.textContent = this.convertMinToTime()

    ShadowStudyApp.updateSunTime(date.getTime()) 
  }

  //Update the state date with the newly selected day of the year
  private updateDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    //Extract date information from string returned by date picker
    const date_string = event.target.value
    var date_info = date_string.split('-')

    const year = Number(date_info[0])
    //We subtract a 1 here because date objects have the index for months starting at 0
    const month = Number(date_info[1]) - 1
    const day = Number(date_info[2])

    //Construct a new date object based on the extracted date information
    var new_date = new Date(year, month, day)

    var old_date = this.state.date
    new_date.setMinutes(old_date.getMinutes())
    new_date.setHours(old_date.getHours())

    //Illegal dates (ex: Feb 30th), do not have a corresponding time, and need to be rejected
    //We also display a message to the user for clarity if an invalid time is entered
    if (Number.isNaN(new_date.getTime())) {
      var invalidDateLabel = document.getElementById('date_invalid')
      if (invalidDateLabel)
        invalidDateLabel.textContent = "Invalid Date Entered. Please Select a Different Date." 
      return 
    }
    else {
      var invalidDateLabel = document.getElementById('date_invalid')
      if (invalidDateLabel)
        invalidDateLabel.textContent = ""  
    }
 
    //If date is valid, update the state, date label, and the sun time
    this.setState({ date: new_date });

    var dateLabel = document.getElementById('date')
    
    if (dateLabel)
      dateLabel.textContent = event.target.value

    ShadowStudyApp.updateSunTime(new_date.getTime()) }

  //Formats the time from the state date into 24 hour time
  private convertMinToTime() {
    var minute = this.state.date.getMinutes()
    var minString: string
    if (minute < 10)
      minString = "0" + String(minute)
    else
      minString =  String(minute)
    var hour = this.state.date.getHours()
    return String(hour) + ":" + minString
  }

  //Initialize the data view when a new iModel is loaded
  //It is possible a time is already selected, at which point we should initialize it to this time as opposed to the current time
  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    if (viewState.is3d()) {
      const viewStyle = viewState.getDisplayStyle3d()
      if(!this.state)
        viewStyle.setSunTime(new Date().getTime())
      else
        viewStyle.setSunTime(this.state.date.getTime() )
      viewState.displayStyle = viewStyle
    }
    return viewState
  }

  public getControlPane() {
    return (
      <>
        <div className="sample-ui">
            <div className="sample-instructions">
              <span>Select a date and time.</span>
              <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/emphasize-elements-sample" />
            </div>
            <hr></hr>
            <div className="sample-options-3col">
              <div>Time of Day</div>
              <input type ="range" min = "0" max = "1439" value = {this.state.date.getHours()*60 + this.state.date.getMinutes()} onChange = {this.updateTime} ></input>
              <div id = "time">{this.convertMinToTime()}</div>
            </div>
            <div className="sample-options-3col">
              <div>Date</div>
              <input type ="date" id = "date_picker" onChange = {this.updateDate}></input>
            <div id = "date">{String(this.state.date.getMonth() + 1) + "/" + this.state.date.getDate() + "/" + this.state.date.getFullYear() }</div>
            </div>
            <div id = "date_invalid" ></div>
          </div>
        </>
    )
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport getCustomViewState = {this.getInitialView} iModelName={this.props.iModelName} />
        {this.getControlPane()}
      </>
    );
  }
}