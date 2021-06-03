/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const getLoaderOptions = require('loader-utils').getOptions
const { validate } = require('schema-utils')

const loaderName = 'editor-file-loader'

const optionsSchema = {
  type: 'object',
  properties: {
    replace: {
      anyOf: [
        {
          instanceof: 'RegExp'
        }
      ]
    }
  },
  additionalProperties: false
}

const defaultOptions = {
  replace: /(?:START|END)\s*([a-z0-9\_\-]+)/i,
}

module.exports = function getOptions(config) {
  const rawOptions = getLoaderOptions(config)

  const options = Object.assign({}, defaultOptions, rawOptions)
  validate(optionsSchema, options, { name: loaderName })

  return options
}