/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ViewSetup } from "api/viewSetup";
import ShadowStudyApp from "./ShadowStudyApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

/** React state of the Sample component */
interface ShadowStudyState {
  date: Date;
}

/** A React component that renders the UI specific for this sample */

export default class ShadowStudyUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, ShadowStudyState> {

  /** Creates an Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);

    // Get date object for current time of day
    const today = new Date();

    this.state = {
      date: today,
    };

    // Initialize sun time to current time
    ShadowStudyApp.updateSunTime(today.getTime());
  }

  // Update the date state with the newly selected minute of the day
  private _updateTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = this.state.date;

    // Time slider represents time of day as a number from 0-1439, one for each minute of the day
    // So we need to modulo by 60 to get the min of the hour
    // And we need to divide by 60, rounded down, to get the hour of the day
    date.setMinutes(Number(event.target.value) % 60);
    date.setHours(Math.floor(Number(event.target.value) / 60));

    // Unlike updateDate, no need to verify a valid time input, since slider doesn't allow for direct user input
    // So we can safely update the state, time label, and sun time

    this.setState({ date });

    const dateLabel = document.getElementById("time");
    if (dateLabel)
      dateLabel.textContent = this.convertMinToTime();

    ShadowStudyApp.updateSunTime(date.getTime());
  }

  // Update the state date with the newly selected day of the year
  private _updateDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Extract date information from string returned by date picker
    const dateString = event.target.value;
    const dateInfo = dateString.split("-");

    const year = Number(dateInfo[0]);
    // We subtract a 1 here because date objects have the index for months starting at 0
    const month = Number(dateInfo[1]) - 1;
    const day = Number(dateInfo[2]);

    // Construct a new date object based on the extracted date information
    const newDate = new Date(year, month, day);

    const oldDate = this.state.date;
    newDate.setMinutes(oldDate.getMinutes());
    newDate.setHours(oldDate.getHours());

    // Illegal dates (ex: Feb 30th), do not have a corresponding time, and need to be rejected
    // We also display a message to the user for clarity if an invalid time is entered
    const invalidDateLabel = document.getElementById("date_invalid");

    if (Number.isNaN(newDate.getTime())) {
      if (invalidDateLabel)
        invalidDateLabel.textContent = "Invalid Date Entered. Please Select a Different Date.";
      return;
    }
    if (invalidDateLabel)
      invalidDateLabel.textContent = "";

    // If date is valid, update the state, date label, and the sun time
    this.setState({ date: newDate });

    const dateLabel = document.getElementById("date");

    if (dateLabel)
      dateLabel.textContent = event.target.value;

    ShadowStudyApp.updateSunTime(newDate.getTime());
  }

  // Formats the time from the state date into 24 hour time
  private convertMinToTime() {
    const minute = this.state.date.getMinutes();
    let minString: string;
    if (minute < 10)
      minString = "0" + String(minute);
    else
      minString = String(minute);
    const hour = this.state.date.getHours();
    return String(hour) + ":" + minString;
  }

  // Initialize the data view when a new iModel is loaded
  // It is possible a time is already selected, at which point we should initialize it to this time as opposed to the current time
  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    if (viewState.is3d()) {
      const viewStyle = viewState.getDisplayStyle3d();
      if (!this.state)
        viewStyle.setSunTime(new Date().getTime());
      else
        viewStyle.setSunTime(this.state.date.getTime());
      viewState.displayStyle = viewStyle;
    }

    // We always want shadows
    viewState.viewFlags.shadows = true;

    return viewState;
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-3col">
          <div>Time of Day</div>
          <input type="range" min="0" max="1439" value={this.state.date.getHours() * 60 + this.state.date.getMinutes()} onChange={this._updateTime} ></input>
          <div id="time">{this.convertMinToTime()}</div>
        </div>
        <div className="sample-options-3col">
          <div>Date</div>
          <input type="date" id="date_picker" onChange={this._updateDate}></input>
          <div id="date">{String(this.state.date.getMonth() + 1) + "/" + this.state.date.getDate() + "/" + this.state.date.getFullYear()}</div>
        </div>
        <div id="date_invalid" ></div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Select a date and time." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport getCustomViewState={this.getInitialView} iModelName={this.props.iModelName} />
      </>
    );
  }
}
