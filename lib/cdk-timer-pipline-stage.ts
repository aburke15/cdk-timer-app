import { StackProps, Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkTimerAppStack } from './cdk-timer-app-stack';

export class CdkTimerPiplineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdkTimerAppStack = new CdkTimerAppStack(this, 'CdkTimerAppStack');
  }
}
