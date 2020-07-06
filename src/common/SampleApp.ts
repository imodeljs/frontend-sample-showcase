import * as  React from "react";

export default abstract class SampleApp {
  public static setup: (iModelName: string, iModelSelector: React.ReactNode) => Promise<React.ReactNode>;
  public static teardown?: () => void;
}
