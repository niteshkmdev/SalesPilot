export const ApiErrorCode = {
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  EMAIL_VERIFICATION_REQUIRED: "EMAIL_VERIFICATION_REQUIRED",
  ORGANIZATION_REQUIRED: "ORGANIZATION_REQUIRED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function authenticationRequired(): AppError {
  return new AppError(
    ApiErrorCode.AUTHENTICATION_REQUIRED,
    "Authentication required.",
    401,
  );
}

export function emailVerificationRequired(): AppError {
  return new AppError(
    ApiErrorCode.EMAIL_VERIFICATION_REQUIRED,
    "Email verification required.",
    403,
  );
}

export function organizationRequired(): AppError {
  return new AppError(
    ApiErrorCode.ORGANIZATION_REQUIRED,
    "Organization context required.",
    403,
  );
}

export function permissionDenied(): AppError {
  return new AppError(
    ApiErrorCode.PERMISSION_DENIED,
    "You do not have permission to perform this action.",
    403,
  );
}
