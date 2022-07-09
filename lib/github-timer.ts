import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

export interface GitHubTimerProps {
  temp: string;
}

export class GitHubTimer extends Construct {
  constructor(scope: Construct, id: string, props: GitHubTimerProps) {
    super(scope, id);

    const handler = new Function(this, "GitHubTimerLambda", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("lambda"),
      handler: "github-timer.handler",
    });

    // create lambda code

    // expose this endpoint via api gateway
    new LambdaRestApi(this, "GitHubTimerEndpoint", {
      handler: handler,
    });
  }
}
