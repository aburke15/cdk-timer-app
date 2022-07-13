import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { GitHubRepoInsert } from "./github-repo-insert";
import { GitHubRepoRead } from "./github-repo-read";

const memoryAndTimeout = {
  memorySize: 768,
  timeout: Duration.minutes(2),
} as const;

export class CdkTimerAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const gitHubRepoTable = new Table(this, "GitHubRepoTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      sortKey: { name: "createdAt", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

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

    // new GitHubRepoInsert(this, "GitHubRepoInsert", {
    //   memoryAndTimeout,
    //   gitHubRepoTable,
    //   gitHubUserSecret,
    //   gitHubPatSecret,
    // });

    new GitHubRepoRead(this, "GitHubRepoRead", {
      memoryAndTimeout,
      gitHubRepoTable,
      gitHubUserSecret,
      gitHubPatSecret,
    });
  }
}
