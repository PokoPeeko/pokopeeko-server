export class GlobalResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}
