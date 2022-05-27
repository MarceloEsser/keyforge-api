export interface BaseResponse {
    message: string;
    code: string;
    status: number;
    data?: any;
}