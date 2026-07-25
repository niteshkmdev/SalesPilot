import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  ApiErrorCode,
  type ApiErrorCode as ApiErrorCodeValue,
  AppError,
} from "@/shared/api/errors";

export interface ApiSuccessResponse<TData> {
  success: true;
  data: TData;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCodeValue;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export function ok<TData>(
  data: TData,
  meta?: Record<string, unknown>,
): NextResponse<ApiSuccessResponse<TData>> {
  return NextResponse.json({ success: true, data, meta });
}

export function created<TData>(
  data: TData,
): NextResponse<ApiSuccessResponse<TData>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function apiError(
  code: ApiErrorCodeValue,
  message: string,
  status: number,
  fields?: Record<string, string[]>,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: { code, message, fields } },
    { status },
  );
}

export function validationError(
  fields: Record<string, string[]>,
): NextResponse<ApiErrorResponse> {
  return apiError(
    ApiErrorCode.VALIDATION_FAILED,
    "Validation failed.",
    422,
    fields,
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    return validationError(formatZodFields(error));
  }

  if (error instanceof AppError) {
    return apiError(error.code, error.message, error.status);
  }

  return apiError(
    ApiErrorCode.INTERNAL_SERVER_ERROR,
    "Internal server error.",
    500,
  );
}

export function formatZodFields(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    const key = path || "root";
    fields[key] = [...(fields[key] ?? []), issue.message];
  }

  return fields;
}
