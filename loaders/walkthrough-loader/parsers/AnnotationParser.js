/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const TITLE_REGEX = /#\s+(.*)/i;
const METADATA_REGEX = /(?:\[_metadata_:.*\]:-\s*\".*\")/i;
const SKIP_REGEX = /\[_metadata_:skip\]:-\s*\"(.*)\"/i
const ANNOTATION_REGEX = /\[_metadata_:annotation\]:-\s*\"(.*)\"/i


class AnnotationParser {

  static deserialize(markdown) {
    const result = [];

    let metadataStack = [];
    let markdownStack = [];

    const splitMarkdown = markdown.split("\n");
    splitMarkdown.forEach((line) => {
      if (TITLE_REGEX.test(line)) {
        if (metadataStack.length > 0) {
          result.push(AnnotationParser.deserializeStep(metadataStack, markdownStack));
          metadataStack = [];
          markdownStack = [];
        }
        metadataStack.push(line);
      } else if (METADATA_REGEX.test(line)) {
        metadataStack.push(line);
      } else {
        markdownStack.push(line);
      }
    })

    if (metadataStack.length > 0) {
      result.push(AnnotationParser.deserializeStep(metadataStack, markdownStack));
    }

    return result;
  }

  static deserializeStep(metadata, markdown) {
    let id, skip, title;

    for (let index = 0; index < metadata.length; index++) {
      let match = metadata[index].match(ANNOTATION_REGEX);
      if (match && match[1]) {
        id = match[1].trim();
      }
      match = metadata[index].match(SKIP_REGEX);
      if (match && match[1]) {
        skip = Boolean(match[1])
      }
      match = metadata[index].match(TITLE_REGEX);
      if (match && match[1]) {
        title = match[1].trim();
      }
    }

    const step = {
      id,
      title,
      skip,
      markdown: markdown.join("\n").trim(),
    }

    return step;
  }
}

module.exports = AnnotationParser;