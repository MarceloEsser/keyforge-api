import * as core from 'express-serve-static-core';

export interface Response<ResBody = any, Locals extends Record<string, any> = Record<string, any>>
    extends core.Response<ResBody, Locals> {}