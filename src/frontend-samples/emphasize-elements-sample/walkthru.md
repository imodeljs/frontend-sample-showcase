# Emphasize Elements

This sample uses the [`EmphasizeElements`](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/emphasizeelements/) class to apply various display effects to an individual or small group of elements.

This sample shows how to apply four different effects:

- Emphasize - Fade all other elements into the background // NEEDSWORK: link to EMPHASIZE
- Hide - Do not display the selected elements // NEEDSWORK: link to HIDE
- Isolate - Do not display all other elements // NEEDSWORK: link to ISOLATE
- Override - Change the color of the selected elements // NEEDSWORK: link to OVERRIDE

For the sample, we first require that the elements be selected by the user and then we call methods to apply the effect to the selected elements.  There are similar methods that can apply the same affects to elements that have not been selected by the user.

[_metadata_:annotation]:- "API"

# Emphasize
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "EMPHASIZE"

# Hide
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "HIDE"

# Isolate
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "ISOLATE"

# Override
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "OVERRIDE"

# Viewer

This sample uses the common pattern of using the `<Viewport>` control along with a custom uiProvider that supplies a customized widget.  See the the tutorial [Customizing the iTwin Viewer](https://developer.bentley.com/tutorials/itwin-viewer-hello-world/#your-first-ui-widget) for more details.

[_metadata_:annotation]:- "VIEWER"

# Widget Setup

The widget initializes by announcing the states for the controls it will return.  Also, it sets up a listener to detect when the user selects elements.  Some controls will only enable after elements have been selected.

[_metadata_:annotation]:- "WIDGET_SETUP"

# Controls

This is where the widget specifies all the user interface controls to be displayed.  For each of the four effects (emphasize, isolate, hide, and override) there is a button to Apply and another button to Clear the effect.

[_metadata_:annotation]:- "CONTROLS"

# On Click

When the user clicks one of the Apply buttons, this method is called to actually produce the requested effect.  When an effect is applied, the widget remembers in a state so that the corresponding hide button can be enabled.

There is a similar onClick call back for the four 'Clear' buttons.

[_metadata_:annotation]:- "ON_CLICK_ACTION"
