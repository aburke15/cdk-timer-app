export type FunctionResponse<TResponse> = {
  statusCode: number;
  headers: {};
  body: TResponse;
};
