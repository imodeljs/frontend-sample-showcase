/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const getLoaderOptions = require('loader-utils').getOptions
const { validate } = require('schema-utils')

const loaderName = 'walkthrough-loader'

const optionsSchema = {
  type: 'object',
  properties: {
    start: {
      anyOf: [
        {
          instanceof: 'RegExp'
        }
      ]
    },
    end: {
      anyOf: [
        {
          instanceof: 'RegExp'
        }
      ]
    },
    identifier: {
      anyOf: [
        {
          instanceof: 'RegExp'
        }
      ]
    },
    replace: {
      anyOf: [
        {
          type: 'string'
        }
      ]
    },
    generatedFileName: {
      anyOf: [
        {
          type: 'string'
        }
      ]
    }
  },
  additionalProperties: false
}

const defaultOptions = {
  start: /START\s*[a-z0-9\_\-]+/,
  end: /END\s*[a-z0-9\_\-]+/,
  identifier: /(?:START|END)\s*([a-z0-9\_\-]+)/,
  generatedFileName: "walkthrough.json",
}

module.exports = function getOptions(config) {
  const rawOptions = getLoaderOptions(config)

  const options = Object.assign({}, defaultOptions, rawOptions)
  validate(optionsSchema, options, { name: loaderName })

  return options
}