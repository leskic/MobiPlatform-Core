import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "./schema/projeto-mobi-v1.schema.json";
import { mapErrors } from "./ErrorMapper";
import type { ValidationResult } from "./types/ValidationResult";

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  useDefaults: false,
  coerceTypes: false,
  removeAdditional: false
});
addFormats(ajv);
const validateSchema = ajv.compile(schema);

export function validate(project: unknown): ValidationResult {
  const valid = validateSchema(project);
  return valid
    ? { valid: true, errors: [] }
    : { valid: false, errors: mapErrors(validateSchema.errors ?? [], project) };
}
