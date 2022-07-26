#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkTimerPipelineStack } from '../lib/cdk-timer-pipeline-stack';

const app = new cdk.App();
new CdkTimerPipelineStack(app, 'CdkTimerPiplineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
