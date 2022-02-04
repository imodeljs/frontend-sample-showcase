# Volume Query Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how you can query and color spatial elements in the iModel using a volume box.

## Purpose

The purpose of this sample is to demonstrate the following:

* Query spatial elements that are inside volume box.
* Sort spatial elements that are inside or overlaping volume box.
* Get spatial elements names for display.
* Color spatial elements.
* List spatial elements that are inside or overlaping volume box.

## Description

This sample demonstrates how you can query and color [`Spatial Elements`](https://www.itwinjs.org/reference/core-backend/elements/spatialelement/) in the iModel using a volume box. The first step is to query elements using [`Spatial Queries`](https://www.itwinjs.org/learning/spatialqueries/) using volume box `Range3d`. Then It classifies given [`Spatial Elements`](https://www.itwinjs.org/reference/core-backend/elements/spatialelement/) using [`getGeometryContainment`](https://www.itwinjs.org/reference/core-backend/imodels/imodeldb/) function. Elements are colored using [`EmphasizeElements`](https://www.imodeljs.org/reference/core-frontend/rendering/emphasizeelements/) class. You can choose colors by using [`ColorPickerButton`](https://www.itwinjs.org/reference/imodel-components-react/color/colorpickerbutton/) from `@bentley/components-react`. To get names of sorted elements [`PresentationLabelsProvider`](https://www.imodeljs.org/reference/presentation-components/displaylabels/presentationlabelsprovider/) is being used. There are iModels that have hundreds of thousands of [`Spatial Elements`](https://www.itwinjs.org/reference/core-backend/elements/spatialelement/), that is why there is a progress bar.

To see volume box, you must turn the toggle button `Volume Box` on. When you adjust the box range click `Apply` button to color elements that are inside/outsite/overlap of the volume box. You can change the color that elements are going to be colored by simply pressing on the color boxes. To remove coloring of the elements, click button `Clear`. Colored elements are listed in `List Colored Elements` section. You can choose between inside or overlap sections. The count of elements are being shown on the bottom of the `List Colored Elements` section.
