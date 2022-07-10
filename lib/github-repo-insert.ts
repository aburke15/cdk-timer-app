import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { MemoryAndTimout } from "./utils/types";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

export interface GitHubRepoInsertProps {
  memoryAndTimeout: MemoryAndTimout;
  table: Table;
}

export class GitHubRepoInsert extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepoInsertProps) {
    super(scope, id);

    const gitHubUserSecret = Secret.fromSecretNameV2(
      this,
      "GitHubUserSecret",
      "GitHubUser"
    );
    const gitHubPatSecret = Secret.fromSecretNameV2(
      this,
      "GitHubPatSecret",
      "GitHubPat"
    );

    const handler = new Function(this, "GitHubRepoInsertHandler", {
      memorySize: props.memoryAndTimeout.memorySize,
      timeout: props.memoryAndTimeout.timeout,
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("lambda"),
      handler: "github-repo-insert.handler",
      environment: {
        GITHUB_USER: gitHubUserSecret.secretValue.unsafeUnwrap().toString(),
        GITHUB_PAT: gitHubPatSecret.secretValue.unsafeUnwrap().toString(),
        TABLE_NAME: props.table.tableName,
      },
    });

    new LambdaRestApi(this, "GitHubRepoInsertEndpoint", {
      handler: handler,
    });

    // create a timer event
    props.table.grantWriteData(handler);
  }
}
