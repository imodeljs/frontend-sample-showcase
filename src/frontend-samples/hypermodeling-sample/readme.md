# Hyper-modeling Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates using hyper-modeling to navigate between 2d and 3d views.

## Purpose

The purpose of this sample is to demonstrate the following:

* How to initialize and configure the @bentley/hypermodeling-frontend package.
* How to toggle hyper-modeling in a viewport.

## Description

Computer-aided design and drafting (CADD) workflows often produce the following:

* A 3d model of an infrastructure asset, such as a building;
* A set of 2d section drawings produced by slicing the 3d model with a clippin plane; and
* A set of sheets intended for printing to paper, onto which the 2d section drawings can be placed and annotated.

Hyper-modeling allows for displaying the 2d section graphics and annotations in the context of the 3d model, and easily navigating between the 2d and 3d views. A clickable marker is displayed at the location of each section drawing. Clicking the marker applies the clipped 3d view that was used to create the 2d section drawing and displays the section drawing graphics and sheet annotations in the 3d view.
