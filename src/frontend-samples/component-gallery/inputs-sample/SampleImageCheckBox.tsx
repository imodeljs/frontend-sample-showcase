/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ImageCheckBox, ImageCheckBoxProps } from "@itwin/core-react";

/** Sample component using ImageCheckBox with a checked state  */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SampleImageCheckBox: React.FC<ImageCheckBoxProps> = (props: ImageCheckBoxProps) => {
  const [checked, setChecked] = React.useState(false);
  // Inverts the current state of the image check box
  const handleClick = (targetChecked: boolean): any => {
    setChecked(targetChecked);

    props.onClick && props.onClick(targetChecked);
  };

  return (
    <ImageCheckBox {...props} checked={checked} onClick={handleClick} />
  );
};
