export function logApeHttpFailure(operation: string, response: Response): void {
  logApeUpstreamFailure(operation, {
    status: response.status,
    requestId: headerValue(response, "x-request-id"),
    traceId: headerValue(response, "x-trace-id"),
  });
}

export function logApeUpstreamFailure(
  operation: string,
  details: {
    status?: number;
    requestId?: string;
    traceId?: string;
  } = {},
): void {
  console.error("APE upstream request failed", {
    operation,
    status: details.status,
    requestId: details.requestId,
    traceId: details.traceId,
  });
}

function headerValue(response: Response, name: string): string | undefined {
  const value = response.headers.get(name)?.trim();
  return value || undefined;
}
