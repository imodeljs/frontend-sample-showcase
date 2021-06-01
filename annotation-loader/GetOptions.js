const getLoaderOptions = require('loader-utils').getOptions
const { validate } = require('schema-utils')

const loaderName = 'annotations-loader'

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
    }
  },
  additionalProperties: false
}

const defaultOptions = {
  start: null,
  end: null,
  replace: "",
  identifier: /[0-9]+/i
}

module.exports = function getOptions(config) {
  const rawOptions = getLoaderOptions(config)

  validate(optionsSchema, rawOptions, { name: loaderName })
  const options = Object.assign({}, defaultOptions, rawOptions)

  return options
}