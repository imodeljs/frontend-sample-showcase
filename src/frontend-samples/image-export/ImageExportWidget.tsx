/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React from "react";
import { Button, ButtonType } from "@itwin/core-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ImageExportApi } from "./ImageExportApi";
import "./ImageExport.scss";

export const ImageExportWidget: React.FunctionComponent = () => {

  return (
    <>
      <div className="sample-options">
        <Button buttonType={ButtonType.Hollow} onClick={ImageExportApi.exportImage.bind(ImageExportApi)}>Save as png</Button>
      </div>
    </>
  );
};

export class ImageExportWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ImageExportWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ImageExportWidget",
          label: "Image Export Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ImageExportWidget />,
        },
      );
    }
    return widgets;
  }
}
