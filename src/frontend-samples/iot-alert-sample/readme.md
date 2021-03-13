# IoT Alerts Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates visualizing alerts by IoT sensor(s) in an iModel.

## Purpose

The purpose of this sample is to demonstrate the following:

- Produce a blinking effect to draw attention to a particular element.
- Show an alert message to notify the user.

## Description

A digital twin typically includes data from multiple sources. This can include data from sensors used to monitor the status of an asset in near real-time. Based on the data coming from the sensors, it can be useful to notify the user about an unusual or out-of-bound condition related to a part of the model.

This sample uses a manual process to trigger an alert related to a particular element. This simulates an out-of-bound condition from a sensor. Once triggered, the app shows an alert notification and then starts up the blinking effect which overrides the element color once per second.
