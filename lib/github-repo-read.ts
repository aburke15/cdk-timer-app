import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { MemoryAndTimout } from "./utils/types";

export interface GitHubRepoReadProps {
  memoryAndTimeout: MemoryAndTimout;
  table: Table;
}

export class GitHubRepoRead extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepoReadProps) {
    super(scope, id);

    const handler = new Function(this, "GitHubRepoReadHandler", {
      memorySize: props.memoryAndTimeout.memorySize,
      timeout: props.memoryAndTimeout.timeout,
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("lambda"),
      handler: "github-repo-read.handler",
    });

    new LambdaRestApi(this, "GitHubRepoReadEndpoint", {
      handler: handler,
    });

    props.table.grantReadData(handler);
  }
}
