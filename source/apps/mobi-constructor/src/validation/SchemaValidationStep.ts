import { validate } from "../../../../validator/SchemaValidator"; import type { Project } from "../../../../builder/types/ProjectTypes"; import type { ValidationError } from "../../../../validator/types/ValidationError";
export class SchemaValidationStep { validate(project: Project): ValidationError[] { return validate(project).errors; } }
