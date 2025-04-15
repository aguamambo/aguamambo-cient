export interface Error{
    status: number,
    error: string,
    message: string,
    path: string,
    timestamp: string,
    fieldErrors: string
}