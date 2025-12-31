import type { AssertNever } from "../objects/object.types";

/**
 * Custom error result details discriminant tags. Add yours here!
 */
const CustomErrorResultDetailsDiscriminantTags = {
  // MyCustomError: "MyCustomError",
} as const;

/**
 * Standard error result details discriminant tags.
 */
const StandardErrorResultDetailsDiscriminantTags = {
  ApiError: "ApiError",
  AssertionFailedError: "AssertionFailedError",
  ShortCircuitedError: "ShortCircuitedError",
  TechnicalError: "TechnicalError",
  UserError: "UserError",
} as const;

/**
 * Constant values for all the error result details discriminant tags.
 */
export const ErrorResultDetailsDiscriminantTags = { ...StandardErrorResultDetailsDiscriminantTags, ...CustomErrorResultDetailsDiscriminantTags } as const;

/**
 * A type for all the error result details discriminant tags.
 */
export type ErrorResultDetailsDiscriminantTag = typeof ErrorResultDetailsDiscriminantTags[keyof typeof ErrorResultDetailsDiscriminantTags];

/**
 * Ensure there are no duplicate discriminant tags.
 */
type StandardErrorResultDetailsDiscriminantTag = typeof StandardErrorResultDetailsDiscriminantTags[keyof typeof StandardErrorResultDetailsDiscriminantTags];
type CustomErrorResultDetailsDiscriminantTag = typeof CustomErrorResultDetailsDiscriminantTags[keyof typeof CustomErrorResultDetailsDiscriminantTags];
type DuplicateTagValues = Extract<CustomErrorResultDetailsDiscriminantTag, StandardErrorResultDetailsDiscriminantTag>;
// NOTE: If there are non-unique discriminant tags, the following line will error and show the duplicate literals.
type _NoDuplicateTagsAllowed = AssertNever<DuplicateTagValues>;
