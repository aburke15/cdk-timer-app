import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { MemoryAndTimout } from "./utils/types";
import { Table } from "aws-cdk-lib/aws-dynamodb";

export interface GitHubRepoInsertProps {
  memoryAndTimeout: MemoryAndTimout;
  table: Table;
}

export class GitHubRepoInsert extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepoInsertProps) {
    super(scope, id);

    // get github creds from secrets mananger

    const handler = new Function(this, "GitHubRepoInsertHandler", {
      memorySize: props.memoryAndTimeout.memorySize,
      timeout: props.memoryAndTimeout.timeout,
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("lambda"),
      handler: "github-repo-insert.handler",
      environment: {
        GITHUB_USER: "",
        GITHUB_PASSWORD: "",
      },
    });

    // create a timer event
    props.table.grantWriteData(handler);
  }
}
