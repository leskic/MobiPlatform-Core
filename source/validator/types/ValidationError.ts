export interface ValidationError {
  code: string;
  path: string;
  message: string;
  expected?: unknown;
  received?: unknown;
}
