import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';


@Injectable()
export class AuthApiService
{
    protected options: any;
    protected headers: HttpHeaders;
    protected baseUrl: string;

    constructor(protected http: HttpClient)
    {
        this.baseUrl = '/auth';

        const r = document.cookie.match("\\b"+name+"=([^;]*)\\b");
        if (r) 
        {
            const headers = new HttpHeaders({'X-XSRFToken': r[1]});
            this.options = {observe: 'response', headers: headers};
        }
        else 
        {
            this.options = {observe: 'response'};
        }
    }

    public post(apiSlug: string, postData: any): Promise<HttpResponse<any>>
    {
        return this.http.post<HttpResponse<any>>(this.baseUrl + apiSlug, postData, this.options)
        .toPromise().then((response: HttpResponse<any>) =>
        {
            const result = response.body as any;
            if (result.Status !== 'Ok')
                throw result;

            return result;
        }).catch(this.handleError);
    }

    public handleError(error: HttpErrorResponse): Promise<HttpErrorResponse>
    {
        const e: any = {
            Status: 'Error',
            ErrorCode: error['ErrorCode'],
            ErrorMessage: error['ErrorMessage']
        };
        
        error = e;

        return Promise.reject(error);
    }
}
