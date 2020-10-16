# Volume Query Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how you can query and color spatial elements in the iModel using volume box.

## Purpose

The purpose of this sample is to demonstrate the following:

* Query spatial elements that are inside volume box.
* Sort spatial elements that are inside or overlaping volume box.
* Get spatial elements names for display.
* Color spatial elements.
* List spatial elements that are inside or overlaping volume box. 

## Description

This sample demonstrates how you can query and color [`Spatial Elements`](https://www.itwinjs.org/reference/imodeljs-backend/elements/spatialelement/?term=spatialeleme) in the iModel using volume box. First step is to query elements using [`Spatial Queries`](https://www.itwinjs.org/learning/spatialqueries/?term=spatialquer) using volume box `Range3d`. Then It classifies given [`Spatial Elements`](https://www.itwinjs.org/reference/imodeljs-backend/elements/spatialelement/?term=spatialeleme) using [`getGeometryContainment`](https://www.imodeljs.org/reference/imodeljs-backend/imodels/imodeldb/getgeometrycontainment/) function. Elements are colored using [`EmphasizeElements`](https://www.imodeljs.org/reference/imodeljs-frontend/rendering/emphasizeelements/?term=emphasizeelements) class. You can choose colors by using [`ColorPickerButton`](https://www.imodeljs.org/reference/ui-components/color/colorpickerbutton/?term=colorpickerbutton) from `@bentley/ui-components`. To get names of sorted elements [`PresentationLabelsProvider`](https://www.imodeljs.org/reference/presentation-components/displaylabels/presentationlabelsprovider/?term=presentationlabelsprovider) is being used. There are iModels that have hundreds of thousands of [`Spatial Elements`](https://www.itwinjs.org/reference/imodeljs-backend/elements/spatialelement/?term=spatialeleme), that is why there is a progress bar. 

To see volume box, you must turn the toggle button `Volume Box` on. When you adjust the box range click `Apply` button to color elements that are inside/outsite/overlap of the volume box. You can change the color that elements are going to be colored by simply pressing on the color boxes. To remove coloring of the elements, click button `Clear`. Colored elements are listed in `List Colored Elements` section. You can choose between inside or overlap sections. The count of elements are being shown on the bottom of the `List Colored Elements` section.
