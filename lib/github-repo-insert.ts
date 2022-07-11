import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { MemoryAndTimout } from "./utils/types";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

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

    const eventRule = new Rule(this, "GitHubRepoInsertScheduleRule", {
      schedule: Schedule.cron({
        minute: "*/5",
        hour: "*",
        month: "*",
        weekDay: "*",
      }),
    });

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

    eventRule.addTarget(new LambdaFunction(handler));
    props.table.grantWriteData(handler);
  }
}
