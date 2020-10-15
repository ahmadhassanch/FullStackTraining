import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';

import { GenericApiResponse } from '../models/api.models';


@Injectable()
export class ApiService
{
    protected options: any;
    protected headers: HttpHeaders;
    protected baseUrl: string;

    public primaryKey: string;
    public apiSlug: string;

    constructor(protected http: HttpClient)
    {
        this.baseUrl = '/api/';
        const r = document.cookie.match('\\b'+name+'=([^;]*)\\b');
        if (r)
        {
            const headers = new HttpHeaders({'X-XSRFToken': r[1]});
            this.options = {observe: 'response', headers};
        }
        else
        {
            this.options = {observe: 'response'};
        }
    }

    public post(apiSlug: string, postData: any): Promise<GenericApiResponse>
    {
        return this.http.post<GenericApiResponse>(this.baseUrl + apiSlug, postData, this.options)
        .toPromise().then((response: HttpResponse<GenericApiResponse>) =>
        {
            const result = response.body as GenericApiResponse;
            if (result.Status !== 'Ok')
                throw result;

            return result;
        }).catch(this.handleError);
    }

    public get(apiSlug: string): Promise<GenericApiResponse>
    {
        return this.http.get<GenericApiResponse>(this.baseUrl + apiSlug, this.options)
        .toPromise().then((response: HttpResponse<GenericApiResponse>) =>
        {
            const result = response.body as GenericApiResponse;
            if (result.Status !== 'Ok')
                throw result;

            return result;
        }).catch(this.handleError);
    }

    public getList(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/List', postData);
    }

    public getSingle(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/Single', postData);
    }

    public getSelectOptions(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/SelectOptions', postData);
    }

    public getFilterOptions(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/FilterOptions', postData);
    }

    public doCreate(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/Create', postData);
    }

    public doUpdate(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/Update', postData);
    }

    public doDelete(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/Delete', postData);
    }

    public doAttachFile(postData: any): Promise<GenericApiResponse>
    {
        return this.post(this.apiSlug + '/Attach', postData);
    }

    // HttpErrorResponse|GenericApiResponse
    public handleError(error: any): Promise<GenericApiResponse>
    {
        if (error.status === 401 || error.ErrorCode === 401)
        {
            window.location.replace('/Authorize');
            return;
        }

        if (error instanceof HttpErrorResponse)
        {
            const e: GenericApiResponse = {
                Status: 'Error',
                ErrorCode: error.status,
                ErrorMessage: error.statusText
            };

            error = e;
        }

        return Promise.reject(error);
    }
}
