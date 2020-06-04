import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { MarkerPinsApp } from ".";

export function getMarkerPinSpec(): SampleSpec {
  return ({
    name: "marker-pin-sample",
    label: "Marker Pins",
    image: "marker-pin-thumbnail.png",
    handlesViewSetup: true,
    files: [
      { name: "index.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
      { name: "MarkerPinDecorator.tsx", import: import("!!raw-loader!./MarkerPinDecorator") },
      { name: "PlaceMarkerTool.tsx", import: import("!!raw-loader!./PlaceMarkerTool") },
      { name: "PopupMenu.tsx", import: import("!!raw-loader!./PopupMenu") },
      { name: "RadioCard.tsx", import: import("!!raw-loader!./RadioCard/RadioCard") },
      { name: "RadioCard.scss", import: import("!!raw-loader!./RadioCard/RadioCard.scss") },
      { name: "PointSelector.tsx", import: import("!!raw-loader!../../common/PointSelector/PointSelector") },
      { name: "PointGenerators.tsx", import: import("!!raw-loader!../../common/PointSelector/PointGenerators") },
    ],
    setup: MarkerPinsApp.setup,
    teardown: MarkerPinsApp.teardown,
  });
}