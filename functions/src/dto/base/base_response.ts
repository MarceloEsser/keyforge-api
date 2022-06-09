import {RequestStatus} from "./request_status";

export interface BaseResponse {
    message: string;
    code: string;
    status: RequestStatus;
    data?: any;

}
