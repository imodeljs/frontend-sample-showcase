/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const METADATA_REGEX = /\[_metadata_:(.*)\]:-\s*\".*\"/i;
const TITLE_REGEX = /\#\s+(.*)/i
const FILE_REGEX = /\[_metadata_:(?:file)\]:-\s*\"(.*)\"/i
const SKIP_REGEX = /\[_metadata_:(?:skip)\]:-\s*\"(.*)\"/i
const START_REGEX = /\[_metadata_:(?:start)\]:-\s*\"(.*)\"/i
const END_REGEX = /\[_metadata_:(?:end)\]:-\s*\"(.*)\"/i


class AnnotationParser {

  static deserialize(markdown) {
    const result = [];

    let metadataStack = [];
    let currentStep;
    let markdownStack = [];

    const splitMarkdown = markdown.split("\n");
    splitMarkdown.forEach((line) => {
      const matches = line.match(METADATA_REGEX);
      if (matches && matches[1]) {
        if (currentStep) {
          currentStep.markdown = markdownStack.join("\n");
          result.push(currentStep);
          currentStep = undefined;
          markdownStack = [];
        }
        if (/file|skip|start|end/i.test(matches[1])) {
          metadataStack.push(matches[0]);
        }
      } else if (!currentStep && TITLE_REGEX.test(line)) {
        metadataStack.push(line);
      } else if (!currentStep && line.length > 0 && metadataStack.length) {
        currentStep = AnnotationParser.deserializeStep(metadataStack, result.length);
        metadataStack = [];
        markdownStack.push(line);
      } else if (currentStep) {
        markdownStack.push(line);
      }
    })

    if (currentStep && markdownStack.length) {
      currentStep.markdown = markdownStack.join("\n").trim();
      result.push(currentStep);
    }

    return result;
  }

  static deserializeStep(metadata, id) {
    let title, file, skip, start, end;

    for (let index = 0; index < metadata.length; index++) {
      let match = metadata[index].match(TITLE_REGEX);
      if (match && match[1]) {
        title = match[1].trim();
      }
      match = metadata[index].match(FILE_REGEX);
      if (match && match[1]) {
        file = match[1].trim();
      }
      match = metadata[index].match(START_REGEX);
      if (match && match[1]) {
        start = parseInt(match[1])
      }
      match = metadata[index].match(END_REGEX);
      if (match && match[1]) {
        end = parseInt(match[1])
      }
      match = metadata[index].match(SKIP_REGEX);
      if (match && match[1]) {
        skip = Boolean(match[1])
      }
    }

    const step = {
      id,
      title,
      file,
      skip,
      startLineNumber: start,
      endLineNumber: end
    }

    return step;
  }

  static serialize(steps) {
    const serialized = steps.map((step) => AnnotationParser.serializeStep(step))

    return serialized.join("\n");
  }

  static serializeStep(step) {
    const result = [];

    if (step.file) {
      result.push(`[_metadata_:file]:- "${step.file}"`)
    }
    if (step.skip) {
      result.push(`[_metadata_:skip]:- "${step.skip}"`)
    }
    if (step.startLineNumber) {
      result.push(`[_metadata_:start]:- "${step.startLineNumber}"`)
    }
    if (step.endLineNumber) {
      result.push(`[_metadata_:end]:- "${step.endLineNumber}"`)
    }
    result.push("");
    if (step.title) {
      result.push(`# ${step.title}`)
    } else {
      result.push(`# Annotation title markdown goes here.`)
    }

    result.push("");
    if (step.markdown) {
      result.push(step.markdown.trim())
    } else {
      result.push("Annotation step markdown goes here.")
    }
    result.push("");

    return result.join("\n");
  }
}

module.exports = AnnotationParser;