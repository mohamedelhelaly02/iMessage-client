export interface ApiProblemDetails {
    title?: string;
    detail?: string;
    status?: number;
    code?: string;
    errors?: Record<string, string[]>;
}