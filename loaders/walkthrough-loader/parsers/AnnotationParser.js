/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const TITLE_REGEX = /#\s+(.*)/i;
const METADATA_REGEX = /(?:\[_metadata_:.*\]:-\s*\".*\")/i;
const INDEX_REGEX = /\[_metadata_:index\]:-\s*\"([0-9]+)\"/i
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
    let id, index, title;

    for (let i = 0; i < metadata.length; i++) {
      let match = metadata[i].match(ANNOTATION_REGEX);
      if (match && match[1]) {
        const parsed = match[1].trim();
        id = parsed !== "NONE" ? parsed : undefined;
      }
      match = metadata[i].match(INDEX_REGEX);
      if (match && match[1]) {
        index = parseInt(match[1].trim());
      }
      match = metadata[i].match(TITLE_REGEX);
      if (match && match[1]) {
        title = match[1].trim();
      }
    }

    const step = {
      id,
      title,
      index,
      markdown: markdown.join("\n").trim(),
    }

    return step;
  }
}

module.exports = AnnotationParser;