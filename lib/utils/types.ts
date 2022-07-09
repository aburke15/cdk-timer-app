import { Duration } from "aws-cdk-lib";

export interface MemoryAndTimout {
  memorySize: number;
  timeout: Duration;
}
