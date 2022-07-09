import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { GitHubTimer } from "./github-timer";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkTimerAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new GitHubTimer(this, "GitHubTimer", {
      temp: "Temp",
    });
  }
}
