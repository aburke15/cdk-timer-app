import { StackProps, Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkTimerAppStack } from './cdk-timer-app-stack';

export class CdkTimerAppPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CdkTimerAppStack(this, 'CdkTimerAppStack');
  }
}
