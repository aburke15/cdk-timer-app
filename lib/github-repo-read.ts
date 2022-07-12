import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { MemoryAndTimout } from "./utils/types";

export interface GitHubRepoReadProps {
  memoryAndTimeout: MemoryAndTimout;
  gitHubRepoTable: Table;
  gitHubUserSecret: ISecret;
  gitHubPatSecret: ISecret;
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
      environment: {
        GITHUB_USER: props.gitHubUserSecret.secretValue
          .unsafeUnwrap()
          .toString(),
        GITHUB_PAT: props.gitHubPatSecret.secretValue
          .unsafeUnwrap()
          .toString(),
      },
    });

    props.gitHubRepoTable.grantReadData(handler);

    new LambdaRestApi(this, "GitHubRepoReadEndpoint", {
      handler: handler,
    });
  }
}
