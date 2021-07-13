# Contributing Sample Code

To add sample code to the repo, there are a few steps required for it to function correctly. The following guidelines will ensure the sample displays correctly and allows other users to edit code directly in the showcase. To begin, create a new folder within the frontend-samples folder. Each sample requires 3 parts, the SampleSpec, the SampleApp, and the UI Component.

## SampleSpec

Each sample is **required** to have a SampleSpec. The SampleSpec's serves three main purposes:

1) Tell the showcase app which React Component needs to be rendered for the sample
2) Provide files to the code editor
3) Provide the link to the screenshot for the navigation carousel.

```ts
interface SampleSpec {
  /** The name of the sample. */
  name: string;
  /** The label that will show up alongside the image in the navigation carousel. */
  label: string;
  /** The url relative to the public folder for the image that appears in the navigation carousel. */
  image: string;
  /** The description used for search index purposes. */
  description?: string;
  /** The readme for the sample. */
  readme?: () => Promise<{ default: string }>;
  /** The walkthrough steps for the sample */
  walkthrough?: () => any;
  /** A list of files that will be imported by the code editor of the showcase. */
  files: IInternalFile[];
  /** The list of models this sample can use, in the case that the sample cannot use all available models */
  iModelList?: string[];
  /** The class name for the sample */
  type: typeof React.Component;
```

Below are more in-depth explanations for some of the SampleSpec properties.

```files```: This property determines which files the editor will import to allow editing and previewing. It should be noted that each SampleSpec requires exactly one ```IInternalFile``` to have the ```entry``` property set to ```true```. Without this property, the code editor will not be able to run the code it has been provided. Each ```IInternalFile``` also requires a dynamic import statement which returns the raw text content. This can be achieved by using the webpack raw-loader  (e.g. ```import(!raw-loader!!./example.tsx);``` ).

```ts
interface IInternalFile {
  /** The name of the file */
  name: string;
  /** The import statement that returns the raw text content of the file. */
  import: any;
  /** Boolean determining whether the file is an entry point to the sample */
  entry?: boolean;
}
```

```sampleClass```: The sample showcase will create an instance of the provided class name as a React Component. All samples should extend React.Component in order to designate what should be rendered in the render() method. In addition, the sample class should be exported as a default class to ensure that it interacts properly with the showcase code editor. React allows for any necessary setup to exist within ComponentDidMount(), and any required cleanup for the sample to exist within ComponentWillUnmount(), which will be called automatically once the sample is mounted or unmounted, respectively. This class will be passed the current iModelName and iModelSelector (if no model list or a model list with more than one model is provided) as props.

## UI Component

The UI component is the component users will interact with in the sample. Typically this would be a component related to iModel.js, however, it is not limited to just iModel.js. Any React component will do just fine. Imports in this file are sensitive as they need to be accessible to the editor as well as to the showcase app. Check the [Imports section](#imports) for more info.

### Using iModel.js in your sample

Using iModel.js in your UI component is relatively easy. To render the viewport for your iModel, there is a ready made component you can import and add to your render method.

```ts
import { Viewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi, } from "@itwinjs-sandbox";
export const MySampleApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Sample Instructions");

  /** The sample's render method */
  public render() {
    return (
      <Viewer
        contextId={sampleIModelInfo.contextId}
        iModelId={sampleIModelInfo.iModelId}
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
        defaultUiConfig={default3DSandboxUi}
        theme="dark"
      />
    );
  }
}
export default MySampleUI;
```

## Imports

Imports can be tricky, as the sample has to be able to resolve it's dependencies both in the showcase and as an external component. There are a few things you can do to help. First, differentiate between relevant sample code that you would like to show in the editor and sample code that can be "hidden away". We'll call them "visible code" and "hidden code" respectively.

### Visible Code

This should be code that you want users to see and interact with in the showcase code editor. To import this code, the import statement should be **relative** (i.e. starts with ```./```) and this file should be included in your SampleSpec files property as an internal file with the same name you have used to import it into the file.

For example:

A UI component (```MyUiComponent.tsx```) may look like this:

```ts
import { MyVisibleFile } from "./MyVisibleFile";
[...]
```

Since I would like this file to be editable, my SampleSpec should reflect it:

```ts
export function getMySampleAppSampleSpec(): SampleSpec {
  return ({
    [...]
    files: [
      { name: "MySampleApp.tsx", import: import("!!raw-loader!./MySampleApp"), entry: true },
      { name: "MyUiComponent.tsx", import: import("!!raw-loader!./MyUiComponent") },
      { name: "MyVisibleFile.tsx", import: import("!!raw-loader!./MyVisibleFile") },
    ],
    type: MySampleApp
  });
}
```

### Hidden Code

This should be code that you may not want users to edit or code that may be unimportant to the sample overall. To import this code, the import statement should be **non-relative** (i.e. **does not** start with ```./```) and should be made relative to the ```src``` directory. References to this file **should not** be included in the SampleSpec files property, rather, a reference needs to be made in the ```Modules.json``` file in the root directory.

For example:

A UI component (```MyUiComponent.tsx```) may reference a file that is located at ```src/MyHiddenFile.tsx```

```ts
import { MyHiddenFile } from "MyHiddenFile";
[...]
```

Since I would like this file to not be editable or viewable, I need to add the following entry to the ```Modules.json``` file:

```json
{
  "name": "MyHiddenFile",
  "import": "./src/MyHiddenFile",
  "typedef": true
}
```

Note that if the file is a scss/sass file, it is not necessary to include the ```"typedef": true``` property, however it will require the ```"import"``` property to include ```!!raw-loader!``` before the file reference.

## Annotations/Walkthrough

To get the most out of the sample, it's suggested to add a walkthrough for your sample. A walkthrough consists of steps which describe sections of code in your sample. In these steps, you, as the author, can explain why and how you used certain methods and patterns to make your sample come to life. Below are guidelines to help you get started with writing your walkthrough.

### Create annotations.md

In the same folder as your sample, create a file called `annotations.md`. This file will contain the steps and markdown for the walkthrough. Each steps consists of three parts: A title, the content, and metadata for the parser.

An example step:

```markdown
# This is a title

This is my step content

[_metadata_:annotation]:- "STEP_ANNOTATION"
```

**Title**: This is what will appear in the dropdown for selecting the current step. Try to keep it short but still describing what you are highlighting.

**content**: This is the content that will appear in the Annotation viewer. It can be as long or as short as you desire but should describe what you are highlighting.

**Metadata**: There are two metadata properties. The first is the _annotation_ metadata property (required). This property describe the tag that the parser should look for when connecting this step to content in the editor. The second is the _skip_ property. If what you are describing is seen as common knowledge for most samples, appending this metadata tag will allow users to skip this step.

### Create Annotation Comments

Each step in the `annotation.md` file requires a _annotation_ metadata property. This metadata property should match annotation start and end comments in the files of your choosing. Each annotation property is required to be uppercase and cannot include spaces but are allowed underscores (_) and dashes (-). Failure to meet these requirements will result in your walkthrough missing steps. The comments are non-inclusive, so surrounding the code you would like to highlight is recommended.

Example:

**annotations.md:**

```markdown
# Hello World

The SampleApp component will return a `div` containing the words "hello world". This works because react renders the dom.

[_metadata_:annotation]:- "HELLO_WORLD"
[_metadata_:skip]:- "true"
```

**MySampleApp.tsx:**

```tsx
1  export const MySampleApp: FunctionComponent = () => {
2  
3    // START HELLO_WORLD
4    return (
5      <div>
6        hello world
7      </div>
8    );
9    // END HELLO_WORLD
10 } 
```

In this example, my "Hello World" step will highlight the lines 4-8. When the file is loaded into the online editor, these comments will be removed.

### Preparing SampleSpec

When using a walkthrough, some additional loaders are needed to ensure the walkthrough is parsed correctly and the comments are removed from the files when loaded into the editor.Instead of using a raw-loader to load the editor files, we need to use the `editor-file-loader`, and to load the annmotations.md file, we need to use the `walkthrough-loader`.

Example:

**SampleSpec.ts:**

```ts
export function getMySampleAppSampleSpec(): SampleSpec {
  return ({
    [...]
    walkthrough: async () => import("!walkthrough-loader!./annotations.md"),
    files: [
      { name: "MySampleApp.tsx", import: import("!editor-file-loader!./MySampleApp"), entry: true },
    ],
    type: MySampleApp
  });
}
```

## Asking Questions

Have a question?
Rather than opening an issue, please ask away on [Stack Overflow](https://stackoverflow.com/tags/imodeljs) using the tag `imodeljs`.

The community will be eager to assist you. Your well-worded question will serve as a resource to others searching for help.

## Providing Feedback

Your comments and feedback are welcome. For general comments or discussion please [click here](https://github.com/imodeljs/imodeljs-samples/labels/discussion) to contribute via GitHub issues using the `discussion` label.

## Reporting Issues

Have you identified a reproducible problem in iModel.js?
Have a feature request?
We want to hear about it!
Here's how you can make reporting your issue as effective as possible.

### Look For an Existing Issue

Before you create a new issue, please do a search in [open issues](https://github.com/imodeljs/frontend-sample-showcase/issues) to see if the issue or feature request has already been filed.

If you find that your issue already exists, please add relevant comments and your [reaction](https://github.com/blog/2119-add-reactions-to-pull-requests-issues-and-comments).
Use a reaction in place of a "+1" comment:

* 👍 - upvote
* 👎 - downvote

If you cannot find an existing issue that describes your bug or feature, create a new issue using the guidelines below.

### Writing Good Bug Reports and Feature Requests

File a single issue per problem and feature request.
Do not enumerate multiple bugs or feature requests in the same issue.

Do not add your issue as a comment to an existing issue unless it's for the identical input.
Many issues look similar, but have different causes.

The more information you can provide, the more likely someone will be successful reproducing the issue and finding a fix.

Please include the following with each issue:

* A short description of the issue that becomes the title
* Versions of relevant iModel.js packages
* Minimal steps to reproduce the issue or a code snippet that demonstrates the issue
* What you expected to see, versus what you actually saw
* Images that help explain the issue
* Any relevant error messages, logs, or other details
* Impact of the issue
* Use the [`bug`](https://github.com/imodeljs/frontend-sample-showcase/labels/bug) or [`enhancement`](https://github.com/imodeljs/frontend-sample-showcase/labels/enhancement) label to identify the type of issue you are filing

Don't feel bad if the developers can't reproduce the issue right away.
They will simply ask for more information!

### Follow Your Issue

You may be asked to clarify things or try different approaches, so please follow your issue and be responsive.

## Contributions

We'd love to accept your contributions to iModel.js.
There are just a few guidelines you need to follow.

### Contributor License Agreement (CLA)

You must sign a [Contribution License Agreement with Bentley](Bentley-CLA.pdf) before your contributions will be accepted.
This a one-time requirement for Bentley projects in GitHub.
You can read more about [Contributor License Agreements](https://en.wikipedia.org/wiki/Contributor_License_Agreement) on Wikipedia.

> Note: a CLA is not required if the change is trivial (such as fixing a spelling error or a typo).

### Pull Requests

All submissions go through a review process.
We use GitHub pull requests for this purpose.
Consult [GitHub Help](https://help.github.com/articles/about-pull-requests/) for more information on using pull requests.

### Types of Contributions

We welcome contributions, large or small, including:

* Bug fixes
* New features
* Documentation corrections or additions
* Example code snippets
* Sample data

Thank you for taking the time to contribute to open source and making great projects like iModel.js possible!
