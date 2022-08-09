export interface FunctionResponse<TResponse> {
  statusCode: number;
  headers: {};
  body: TResponse;
}
