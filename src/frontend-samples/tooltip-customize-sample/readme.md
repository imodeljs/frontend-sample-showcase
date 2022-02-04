# Tooltip Customize Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to customize the element tooltip.  The customized tooltip is shown when the user hovers the mouse pointer over a spatial element within the iModel.js viewport.

## Purpose

The purpose of this sample is to demonstrate the following:

* Specify the content of a tooltip by [implementing ToolAdmin.getToolTip](./TooltipCustomizeApi.tsx).
* Display a tooltip by implementing [NotificationManager](https://www.imodeljs.org/reference/core-frontend/notifications/notificationmanager/).

## Description

Requests to display tooltips originate in the core-frontend package whenever the mouse pointer hovers over an element or decoration.  The core-frontend package forwards that event to the method ToolAdmin.getToolTip.  By default, ToolAdmin forwards the request to the active tool.  In this sample, we create a subclass of ToolAdmin and override ToolAdmin.getTooltip and take over the process of generating the tooltip contents.  The sample code produces an HTMLElement which it returns to the core-frontend.

The core-frontend package is written to be independent of any specific user interface framework.  As such, it cannot display the tooltip directly.  Instead it forwards the HTMLElement for the tooltip to NotificationManager.showToolTip.
