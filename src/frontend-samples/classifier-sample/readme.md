# Classifier Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to apply classifiers to a reality model.

## Purpose

The purpose of this sample is to demonstrate the following:

- Create a classifer
- Demonstrate various classifier options
- Use classifiers to select elements and display their properties

## Description

This sample features a reality data model of the city of Philadelphia. It also includes building footprint, street, light pole, and commercial corridor data that has been collected from
open source datasets and connected into the iModel. 

[`ClassifierApp`](./ClassifierApp.tsx) has the necessary static methods for interacting with classifier related portions of the iModel.js API.

First the reality model must be attached to the viewport. There is more info about interacting with reality models in the [reality model sample](../reality-data-sample/readme.md).

Next the list of available classifiers are queried in `getAvailableClassifierListForViewport`. This is done querying for available [SpatialModelState](https://www.itwinjs.org/reference/imodeljs-frontend/modelstate/spatialmodelstate/)s in the iModel. The results are then sorted and filtered for demonstration purposes.

Finally, the classifier needs to be formed and attached to the view. The classifier needs to be formed as a [SpatialClassificationProps.Properties](https://www.itwinjs.org/reference/imodeljs-common/displaystyles/spatialclassificationprops/spatialclassificationprops.properties) object. It can then be added to [ContextRealityModelProps.classifiers](https://www.itwinjs.org/reference/imodeljs-common/displaystyles/contextrealitymodelprops/#classifiers) and reattached to the viewport.

Classifiers have several properties that the user can set:

- [expand](https://www.itwinjs.org/reference/imodeljs-common/displaystyles/spatialclassificationprops/spatialclassificationprops.classifier/expand/): A distance in meters to expand the classification around the basic geometry.
- [inside](https://www.itwinjs.org/reference/imodeljs-common/displaystyles/spatialclassificationprops/spatialclassificationprops.flagsprops/#inside): How to display elements inside the classifier -- Off, On, Dimmed, Hilite, or Element Color.
- [outside](https://www.itwinjs.org/reference/imodeljs-common/displaystyles/spatialclassificationprops/spatialclassificationprops.flagsprops/#outside): How to display elements outside the classifier -- Off, On, Dimmed, Hilite, or Element Color.

Additionally, this sample features a property data provider. This shows basic properties of selected elements. For more info on property data providers and property formatting see [property formatting sample](../property-formatting-sample/readme.md).

