# React Marker Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to use the [@bentley/imodel-react-hooks](/https://github.com/imodeljs/viewer-components-react/tree/master/packages/imodel-react-hooks)
package for simple [Markers](https://www.imodeljs.org/learning/frontend/markers/).
With arbitrary dynamic jsx passed to jsxElement, we can do anything React+HTML can on top of world space.

## Purpose

The purpose of this sample is to demonstrate the following:

- Using the [Marker component or useMarker hook](https://github.com/imodeljs/viewer-components-react/tree/master/packages/imodel-react-hooks#usemarker) to make
  markers that render arbitrary dynamic JSX with React.
- Advanced React state integration with a [PrimitiveTool](https://www.imodeljs.org/reference/imodeljs-frontend/tools/primitivetool/) that can use all React state

## Description

[Markers](https://www.imodeljs.org/learning/frontend/markers/) are a common technique to draw a user's attention to a particular spatial location within a digital twin.  Markers are typically organized into [marker sets](https://www.imodeljs.org/reference/imodeljs-frontend/views/markerset/) and displayed by a [decorator](https://www.imodeljs.org/reference/imodeljs-frontend/views/decorator/). However, [@bentley/imodel-react-hooks](https://github.com/imodeljs/viewer-components-react/tree/master/packages/imodel-react-hooks) is a
simpler solution, it lacks a few scaling features as a tradeoff to be much simpler, it doesn't require setting up a decorator or using a Marker set and fits into a React component
instead of requiring subclassing the Marker class.
