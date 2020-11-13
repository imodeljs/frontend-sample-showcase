# Property Formatting Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to query and present element property data suitable for end users.

## Purpose

The purpose of this sample is to demonstrate the following:

- Using [PresentationPropertyDataProvider](https://www.itwinjs.org/reference/presentation-components/propertygrid/presentationpropertydataprovider/) together with the [PropertyGrid](https://www.itwinjs.org/reference/ui-components/propertygrid/propertygrid/) react component to present the default set of properties for an iModel element.
- Creating a subclass of PresentationPropertyDataProvider to customize the properties that are presented in the property grid.
- Using [PresentationTableDataProvider](https://www.itwinjs.org/reference/presentation-components/table/presentationtabledataprovider/) together with the [Table](https://www.itwinjs.org/reference/ui-components/table/table/) react component to present a table containing the the default set of properties for a set of iModel elements.
- Using [Presentation.getContent](https://www.itwinjs.org/reference/presentation-frontend/core/presentationmanager/getcontent/) to directly query the formatted property data so that you can use it independently of our user interface components.

## Description

Even though you can access all of an iModel's data via ECSQL queries, the properties returned that way are not directly suitable for presentation to an end user.  For one thing, individual properties must typically be formatted specifically for presentation purposes (ex. unit conversions and date-time conventions).  Also, the user's perception of a single element doesn't always match the raw data storage (ex. [relationships](https://www.itwinjs.org/bis/intro/relationship-fundamentals/) and [element aspects](https://www.itwinjs.org/bis/intro/elementaspect-fundamentals/)).  For these reasons, it is often necessary to use the [Presentation Library](https://www.itwinjs.org/learning/presentation/).

This sample illustrates three approaches for showing element properties.  Which approach to choose depends on you goal and what if any customization you need for your use case.

- Approach 1: Using PropertyGrid.  If you want to show the properties using the default user interface control.
- Approach 2: Using Table.  To see properties from multiple elements at the same time in the default way.
- Approach 3: Do it all yourself.  If you want to query the properties and access them directly in your own code.  For example to use your own user interface component.

All three approaches are based on the same three steps.

1. Query the backend for the information on a set of elements.  This is called Content.
2. Process the Content and create a set of PropertyRecords suitable for the user interface.
3. Use the PropertyRecords to populate a UI component.
