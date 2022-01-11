/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import "./ShadowStudy.scss";
import ShadowStudyApi from "./ShadowStudyApi";
import { Input } from "@itwin/core-react";

const ShadowStudyWidget: React.FunctionComponent = () => {
  const [dateState, setDateState] = React.useState<Date>(new Date());

  useEffect(() => {
    // Initialize sun time to current time
    ShadowStudyApi.updateSunTime(dateState.getTime());
  }, [dateState]);

  // Update the date state with the newly selected minute of the day
  const _updateTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(dateState);

    // Time slider represents time of day as a number from 0-1439, one for each minute of the day
    // So we need to modulo by 60 to get the min of the hour
    // And we need to divide by 60, rounded down, to get the hour of the day
    date.setMinutes(Number(event.target.value) % 60);
    date.setHours(Math.floor(Number(event.target.value) / 60));

    // Unlike updateDate, no need to verify a valid time input, since slider doesn't allow for direct user input
    // So we can safely update the state, time label, and sun time

    setDateState(date);

    const dateLabel = document.getElementById("time");
    if (dateLabel)
      dateLabel.textContent = convertMinToTime();

    ShadowStudyApi.updateSunTime(date.getTime());
  };

  // Update the state date with the newly selected day of the year
  const _updateDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Extract date information from string returned by date picker
    const dateString = event.target.value;
    const dateInfo = dateString.split("-");

    const year = Number(dateInfo[0]);
    // We subtract a 1 here because date objects have the index for months starting at 0
    const month = Number(dateInfo[1]) - 1;
    const day = Number(dateInfo[2]);

    // Construct a new date object based on the extracted date information
    const newDate = new Date(year, month, day);

    const oldDate = dateState;
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
    setDateState(newDate);

    const dateLabel = document.getElementById("date");

    if (dateLabel)
      dateLabel.textContent = event.target.value;

    ShadowStudyApi.updateSunTime(newDate.getTime());
  };

  // Formats the time from the state date into 24 hour time
  const convertMinToTime = () => {
    const minute = dateState.getMinutes();
    let minString: string;
    if (minute < 10)
      minString = `0${String(minute)}`;
    else
      minString = String(minute);
    const hour = dateState.getHours();
    return `${String(hour)}:${minString}`;
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-3col">
          <div>Time of Day</div>
          <input type="range" min="0" max="1439" value={dateState.getHours() * 60 + dateState.getMinutes()} onChange={_updateTime} ></input>
          <div id="time">{convertMinToTime()}</div>
        </div>
        <div className="sample-options-3col">
          <div>Date</div>
          <Input type="date" id="date_picker" onChange={_updateDate}></Input>
          <div id="date">{`${String(dateState.getMonth() + 1)}/${dateState.getDate()}/${dateState.getFullYear()}`}</div>
        </div>
        <div id="date_invalid" ></div>
      </div>
    </>
  );
};

export class ShadowStudyWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ShadowStudyWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ShadowStudyWidget",
          label: "Shadow Study Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ShadowStudyWidget />,
        },
      );
    }
    return widgets;
  }
}
