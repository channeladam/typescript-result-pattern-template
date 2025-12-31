import type { HttpStatusCode } from "./http.ietf.types";

/**
 * The shape of an error response from a NestJS API. 
 * Based on https://github.com/nestjs/nest/blob/master/packages/common/interfaces/http/http-exception-body.interface.ts
 */
export type NestJSHttpErrorResponse = {
    statusCode: HttpStatusCode;
    message: string | string[] | number;
    error?: string;
}
