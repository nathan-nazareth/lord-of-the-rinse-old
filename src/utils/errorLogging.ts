interface ErrorInfo {
  componentStack?: string;
}

interface StructuredError {
  message: string;
  timestamp: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  componentStack?: string;
  type: "runtime" | "promise" | "resource" | "render";
}

export const logError = (
  error: Error,
  type: "render" | "runtime" = "render",
  info?: ErrorInfo,
): void => {
  const structuredError: StructuredError = {
    message: error.message,
    timestamp: new Date().toISOString(),
    stack: error.stack,
    type,
  };

  if (info?.componentStack) {
    structuredError.componentStack = info.componentStack;
  }

  console.error("[Error]", JSON.stringify(structuredError, null, 2));
};

export const logResourceError = (event: Event): void => {
  const target = event.target as HTMLElement;
  let src = "unknown";

  if (target instanceof HTMLScriptElement) {
    src = target.src;
  } else if (target instanceof HTMLLinkElement) {
    src = target.href;
  } else if (target instanceof HTMLImageElement) {
    src = target.src;
  }

  const error: StructuredError = {
    message: `Failed to load resource: ${src}`,
    timestamp: new Date().toISOString(),
    type: "resource",
    filename: src !== "unknown" ? src : undefined,
  };

  console.error("[Resource Error]", JSON.stringify(error, null, 2));
};

export const logUnhandledRejection = (event: PromiseRejectionEvent): void => {
  const error: StructuredError = {
    message: event.reason?.message || "Unhandled Promise Rejection",
    timestamp: new Date().toISOString(),
    stack: event.reason?.stack,
    type: "promise",
  };

  console.error("[Unhandled Promise]", JSON.stringify(error, null, 2));
};

export const setupGlobalErrorHandlers = (): void => {
  window.addEventListener("error", (event) => {
    if (event.message) {
      const error: StructuredError = {
        message: event.message,
        timestamp: new Date().toISOString(),
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: "runtime",
      };
      console.error("[Global Error]", JSON.stringify(error, null, 2));
    }
  });

  window.addEventListener("unhandledrejection", logUnhandledRejection);
};

export interface Web3FormsErrorLog {
  message: string;
  timestamp: string;
  orderId?: string;
  errorType: "rate_limit" | "unauthorized" | "validation" | "server_error" | "network_error";
  attempt?: number;
  maxRetries?: number;
}

export const logWeb3FormsRateLimit = (
  orderId: string,
  attempt: number,
  maxRetries: number,
): void => {
  const errorLog: Web3FormsErrorLog = {
    message: "Web3Forms API rate limit exceeded",
    timestamp: new Date().toISOString(),
    orderId,
    errorType: "rate_limit",
    attempt,
    maxRetries,
  };
  console.warn("[Web3Forms Rate Limit]", JSON.stringify(errorLog, null, 2));
};

export const logWeb3FormsError = (
  orderId: string,
  errorType: Web3FormsErrorLog["errorType"],
  message: string,
  attempt?: number,
): void => {
  const errorLog: Web3FormsErrorLog = {
    message,
    timestamp: new Date().toISOString(),
    orderId,
    errorType,
    attempt,
  };
  console.error("[Web3Forms Error]", JSON.stringify(errorLog, null, 2));
};

export const logWeb3FormsSuccess = (orderId: string): void => {
  const successLog = {
    message: "Web3Forms submission successful",
    timestamp: new Date().toISOString(),
    orderId,
  };
  console.log("[Web3Forms Success]", JSON.stringify(successLog, null, 2));
};
