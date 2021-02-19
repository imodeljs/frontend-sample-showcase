# IoT Alerts Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates alerts by IoT sensor(s) in an iModel.

## Purpose

The purpose of this sample is to demonstrate sensor alerts.

## Description

A digital twin can be synchronized from multiple sources including sensors and continuous surveying to represent near real-time status. This synchronized data can be used to gain valuable insights to fully understand the phyiscal asset. All the physical assets have their individual sensors connected to them that help determine their overall health. For example a bridge asset can have vibration and deflection sensor, a tunnel asset can have air quality and temperature sensors. On roadways we can have vehicle counter that helps to determine congestion on the road. When we turn on the alerts from these sensors, then observed elements (such as assets) by the sensor would start blinking to indicate any issues.

[`IotAlertApp`](./IotAlertApp.tsx) has the necessary static methods for emphasizing elements using iModel.js API.
