/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BeEvent } from "@itwin/core-bentley";

export type DragAndDropApiEvent = () => void;

export class DragAndDropTreeApi {

  private static event: BeEvent<DragAndDropApiEvent> = new BeEvent();

  public static reset() {
    DragAndDropTreeApi.event.raiseEvent();
  }

  public static on(callback: DragAndDropApiEvent) {
    return DragAndDropTreeApi.event.addListener(callback);
  }

}
