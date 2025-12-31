import type { HttpApiProblemDetails } from "./http.ietf.types";

/**
 * Equivalent of ASP.NET Core's problem details response.
 * See https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.validationproblemdetails
 */
export type AspNetValidationProblemDetails = HttpApiProblemDetails & {
  errors?: Record<string, string[]>;
};