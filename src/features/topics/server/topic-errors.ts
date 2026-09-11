export class TopicCatalogUnavailableError extends Error {
  constructor(message = "The topic catalog is unavailable.") {
    super(message);
    this.name = "TopicCatalogUnavailableError";
  }
}

export class TopicConcurrencyError extends Error {
  constructor(message = "This topic was changed by another edit.") {
    super(message);
    this.name = "TopicConcurrencyError";
  }
}

export class TopicValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TopicValidationError";
  }
}

export class TopicConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TopicConflictError";
  }
}

export class TopicNotFoundError extends Error {
  constructor(message = "Topic not found.") {
    super(message);
    this.name = "TopicNotFoundError";
  }
}

export function isTopicCatalogUnavailableError(
  error: unknown,
): error is TopicCatalogUnavailableError {
  return error instanceof TopicCatalogUnavailableError;
}
