export interface AwsRegion {
  readonly region: string;
}

export interface AwsApiVersion {
  readonly apiVersion: string;
}

export const region: AwsRegion = {
  region: 'us-west-2',
};

export const apiVersion: AwsApiVersion = {
  apiVersion: '2012-08-10',
};
