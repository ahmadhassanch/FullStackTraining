export interface GenericApiResponse
{
    Status: string;
    ErrorCode?: number;
    ErrorMessage?: string;
    statusMessage?: string;
    Time?: number;
    total_records?: number;

    data?: any;
}
