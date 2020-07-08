# Contributing Sample Code

To add sample code to the repo, there are a few steps required for it to function correctly. The following guidelines will ensure the sample displays correctly and allows other users to edit code directly in the showcase. To begin, create a new folder within the frontend-samples folder. Each sample requires 3 parts, the SampleSpec, the SampleApp, and the UI Component.

## SampleSpec

Each sample is **required** to have a SampleSpec. The SampleSpec's serves three main purposes:
1) Tell the showcase app how to setup and teardown the sample
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
  /** A list of files that will be imported by the code editor of the showcase. */
  files: InternalFile[];
  /** The list of models this sample can use, in the case that the sample cannot use all available models */
  customModelList?: string[];
  /** The function that will setup and return the UI component of the sample. */
  setup: (iModelName: string, iModelSelector?: React.ReactNode) => Promise<React.ReactNode>;
  /** The function that will teardown anything that was required for the sample to function. */
  teardown?: () => void;
}
```

Below are more in-depth explanations for some of the SampleSpec properties.

```files```: This property determines which files the editor will import to allow editing and previewing. It should be noted that each SampleSpec requires exactly one ```InternalFile``` to have the ```entry``` property set to ```true```. Without this property, the code editor will not be able to run the code it has been provided. Each ```InternalFile``` also requires a dynamic import statement which returns the raw text content. This can be achieved by using the webpack raw-loader  (e.g. ```import(!raw-loader!!./example.tsx);``` ).

```ts
interface InternalFile {
  /** The name of the file */
  name: string;
  /** The import statement that returns the raw text content of the file. */
  import: any;
  /** Boolean determining whether the file is an entry point to the sample */
  entry?: boolean;
}
```

```setup```: This method will be passed the current iModelName and iModelSelector (if no model list or a model list with more than one model is provided). Any required setup for the sample UI should occur within this method and it should return the React UI element that will be displayed when the given sample is selected. Typically this is a static method provided by the [SampleApp](#SampleApp).

```teardown```: (Optional). This method will be called when the sample is navigated away from. Any required cleanup should occur within this method. Typically this is a static method provided by the [SampleApp](#SampleApp).

## SampleApp

Each sample should have a default class that implements the SampleApp class. Implementing this class will ensure the sample will be able to run after a user has changed code within the code editor of the showcase. Imports in this file are sensitive as they need to be accessible to the editor as well as to the showcase app. Check the [Imports section](#imports) for more info.

```ts
abstract class SampleApp {
  public static setup: (iModelName: string, iModelSelector: React.ReactNode) => Promise<React.ReactNode>;
  public static teardown?: () => void;
}
```

Below are more in-depth explanations for the SampleApp properties.

```setup```: This method will be passed the current iModelName and iModelSelector (if no model list or a model list with more than one model is provided). Any required setup for the sample UI should occur within this method and it should return the React UI element that will be displayed when the given sample is selected. This method will typically be referenced by the [SampleSpec setup property](#SampleSpec).

```teardown```: (Optional). This method will be called when the sample is navigated away from. Any required cleanup should occur within this method. This method will typically be referenced by the [SampleSpec teardown property](#SampleSpec).

## UI Component

The UI component is the component users will interact with in the sample. Typically this would be a component related to iModel.js, however, it is not limited to just iModel.js. Any React component will do just fine. Imports in this file are sensitive as they need to be accessible to the editor as well as to the showcase app. Check the [Imports section](#imports) for more info.

### Using iModel.js in your sample

Using iModel.js in your UI component is relatively easy. To render the viewport for your iModel, there is a ready made component you can import and add to your render method.

```ts
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport"; // That's not a typo, be sure to import the component as non-relative.
export default class MySampleUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, {}> {

  /** The sample's render method */
  public render() {
    return (
      <ReloadableViewport iModelName={this.props.iModelName} />
    );
  }
}
```

## Imports

Imports can be tricky, as the sample has to be able to resolve it's dependencies both in the showcase and as an external component. There are a few things you can do to help. First, differentiate between relevant sample code that you would like to show in the editor and sample code that can be "hidden away". We'll call them "visible code" and "hidden code" respectively.

### Visible Code

This should be code that you want users to see and interact with in the showcase code editor. To import this code, the import statement should be **relative** (i.e. starts with ```./```) and this file should be included in your SampleSpec files property as an internal file with the same name you have used to import it into the file.

For example:

A UI component (```MyUiComponent.tsx```) may look like this:

```ts
import { MyRequiredValue } from "./MyRequiredFile";
[...]
```

Since I would like this file to be editable, my SampleSpec should reflect it:

```ts
import MySampleApp from "./MySampleApp";
export function getMySampleAppSampleSpec(): SampleSpec {
  return ({
    [...]
    files: [
      { name: "MySampleApp.tsx", import: import("!!raw-loader!./MySampleApp"), entry: true },
      { name: "MyUiComponent.tsx", import: import("!!raw-loader!./MyUiComponent") },
      { name: "MyRequiredFile.tsx", import: import("!!raw-loader!./MyRequiredFile") },
    ],
    setup: MySampleApp.setup,
    teardown: MySampleApp.teardown,
  });
}
```

### Hidden Code

This should be code that you may not want users to edit or code that may be unimportant to the sample overall. To import this code, the import statement should be **non-relative** (i.e. **does not** start with ```./```) and should be made relative to the ```src``` directory. References to this file **should not** be included in the SampleSpec files property, rather, a reference needs to be made in the ```Modules.json``` file in the root directory.

For example:

A UI component (```MyUiComponent.tsx```) may reference a file that is located at ```src/myRequiredFile.tsx```

```ts
import { MyRequiredValue } from "MyRequiredFile";
[...]
```

Since I would like this file to not be editable or viewable, I need to add the following entry to the ```Modules.json``` file:

```json
{
  "name": "MyRequiredFile",
  "import": "./src/MyRequiredFile",
  "typedef": true
}
```

Note that if the file is a scss/sass file, it is not necessary to include the ```"typedef": true``` property, however it will require the ```"import"``` property to include ```!!raw-loader!``` before the file reference.
