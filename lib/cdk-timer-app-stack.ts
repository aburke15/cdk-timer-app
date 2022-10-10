import * as CDK from 'aws-cdk-lib';
import { SecretValue } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import * as Route53 from 'aws-cdk-lib/aws-route53';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { GitHubRepo } from './github-repo';
import { GitHubRepoRead } from './github-repo-read';
import * as Types from './utils/types';

const memoryAndTimeout: Types.MemoryAndTimoutOptions = {
  memorySize: 512,
  timeout: CDK.Duration.seconds(30),
};

export class CdkTimerAppStack extends CDK.Stack {
  private readonly domainName: string = 'aburke.tech';
  private readonly proj: string = 'proj';

  constructor(scope: Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    const gitHubRepoTable = new Table(this, 'GitHubRepoTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: CDK.RemovalPolicy.DESTROY,
    });

    // put the table arn in an aws secret to be referenced elsewhere
    new Secret(this, 'GitHubRepoTableArnSecret', {
      secretName: 'GitHubRepoTableArn',
      secretStringValue: new SecretValue(gitHubRepoTable.tableArn),
    });

    new Secret(this, 'GitHubRepoTableNameSecret', {
      secretName: 'GitHubRepoTableName',
      secretStringValue: new SecretValue(gitHubRepoTable.tableName),
    });

    const gitHubUserSecret = Secret.fromSecretNameV2(this, 'GitHubUserSecret', 'GitHubUser');
    const gitHubTokenSecret = Secret.fromSecretNameV2(this, 'GitHubTokenSecret', 'GitHubToken');

    new GitHubRepo(this, 'GitHubRepo', {
      memoryAndTimeout,
      gitHubRepoTable,
      gitHubUserSecret,
      gitHubTokenSecret,
    });

    const gitHubRepoRead = new GitHubRepoRead(this, 'GitHubRepoRead', {
      memoryAndTimeout,
      gitHubRepoTable,
    });

    const zoneSecret = Secret.fromSecretNameV2(this, `AburkeTechHostedZoneIdSecret`, `AburkeTechHostedZoneId`);
    const certSecret = Secret.fromSecretNameV2(this, `AburkeTechCertificateArnSecret`, `AburkeTechCertificateArn`);

    const zoneId: string = zoneSecret?.secretValue?.unsafeUnwrap()?.toString();
    const certArn: string = certSecret?.secretValue?.unsafeUnwrap()?.toString();

    const aburkeTechCert = Certificate.fromCertificateArn(this, `AburkeTechCertificate`, certArn);

    const aburkeTechZone = PublicHostedZone.fromPublicHostedZoneAttributes(this, `AburkeTechPublicHostedZone`, {
      hostedZoneId: zoneId,
      zoneName: this.domainName,
    });

    gitHubRepoRead.restApi.addDomainName(`GitHubRepoApiDomain`, {
      domainName: `${this.proj}.${this.domainName}`,
      certificate: aburkeTechCert,
    });

    new Route53.ARecord(this, `GitHubRepoARecord`, {
      recordName: this.proj,
      target: Route53.RecordTarget.fromAlias(new ApiGateway(gitHubRepoRead.restApi)),
      zone: aburkeTechZone,
    });
  }
}
