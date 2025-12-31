import type { HttpApiProblemDetails } from "./http.ietf.types";

/**
 * The standard API error response type to use for all API responses in your application.
 * Customize this as necessary for your application.
 */
export type StandardApiErrorResponse = HttpApiProblemDetails;

// export type StandardApiErrorResponse = HttpApiProblemDetails & {
//     canRetry?: boolean;
// };
// export type StandardApiErrorResponse = AspNetValidationProblemDetails;
// export type StandardApiErrorResponse = NestJSHttpErrorResponse;
