import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { GitHubRepoInsert } from "./github-repo-insert";
import { GitHubRepoRead } from "./github-repo-read";
import { MemoryAndTimout } from "./utils/types";

const memoryAndTimeout: MemoryAndTimout = {
  memorySize: 1024,
  timeout: Duration.minutes(2),
} as const;

export class CdkTimerAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const gitHubRepoTable = new Table(this, "GitHubRepoTable", {
      partitionKey: { name: "id", type: AttributeType.NUMBER },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new GitHubRepoInsert(this, "GitHubRepoInsert", {
      memoryAndTimeout: memoryAndTimeout,
      table: gitHubRepoTable,
    });

    // new GitHubRepoRead(this, "GitHubRepoRead", {
    //   memoryAndTimeout: memoryAndTimeout,
    //   table: gitHubRepoTable,
    // });
  }
}
