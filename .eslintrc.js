/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
// Provide a blank config so that build doesn't fail due to ESLint warnings from react-scripts build step
// The plugins need to be loaded to avoid getting errors from eslint-disable comments
// npm lint script uses an alternative configuration provided in package.json

module.exports = {
  "extends": ["react-app"],
  "rules": {
  },
  "overrides": [
    {
      "files": ["**/*.ts?(x)"],
      "rules": {
// ******** add ignore rules here *********
      }
    }
  ]
}
