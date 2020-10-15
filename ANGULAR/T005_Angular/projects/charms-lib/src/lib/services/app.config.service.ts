import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';

import { GenericApiResponse } from '../models/api.models';

import { RVAlertsService } from '../components/alerts';

declare var  JSEncrypt: any;
declare var  KEYUTIL: any;
declare var  KJUR: any;


export function chiConfigFactoryProvider(configService: ChiConfigService)
{
    return () => configService.loadConfig();
}

@Injectable({
    providedIn: 'root'
})
export class ChiConfigService
{
    private _config: any;
    private securityCode: any;
    // tslint:disable-next-line:variable-name
    private private_key: any;
    private Encryptor: any;
    private Decryptor: any;
    public checkSecurity: Subject<any>;

    private _controllers = {};
    private options: any;

    private _userData = {};

    constructor(private http: HttpClient)
    {
        this._config = {
            permissions: {}
        };

        this.private_key = null;
        this.Encryptor = null;
        this.Decryptor = null;
        this.checkSecurity = new Subject();

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

    public loadConfig(): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.post('/api/app_main/MenuPermissions', {}).then(resp =>
            {
                this._config = resp.data;

                if (this._config.SecureModeEnabled)
                {
                    this.InitEncryptor();
                    const passcode = localStorage.getItem('security_code');
                    if (passcode != null) {
                        this.InitDecryptor(passcode);
                    }
                }

                resolve(resp);
            }, (error) =>
            {
                reject(error);
            });
        });
    }

    public post(url: string, postData: any): Promise<GenericApiResponse>
    {
        return this.http.post<GenericApiResponse>(url, postData, this.options)
        .toPromise().then((response: HttpResponse<GenericApiResponse>) =>
        {
            const result = response.body as GenericApiResponse;
            if (result.Status !== 'Ok')
                throw result;

            return result;
        }).catch(this.handleError);
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

    public getConfig()
    {
        return this._config;
    }

    public getWsBaseUrl()
    {
        // tslint:disable-next-line:variable-name
        const base_url = this._config.base_url;
        // let base_url = 'http://localhost:4200';

        const url =  base_url + '/ws/cmclient';
        // tslint:disable-next-line:variable-name
        let socket_url = '';
        if (url.indexOf('https') !== -1)
        {
            socket_url = url.replace('https', 'wss');
        }
        else
        {
            socket_url = url.replace('http', 'ws');
        }
        if (this._config.token)
            socket_url += '?token=' + this._config.token;

        return socket_url;
    }

    public getPlayBackWsBaseUrl()
    {
        const base_url = this._config.base_url;
        // let base_url = 'http://localhost:4200';

        const url =  base_url + '/ws/cmplayback';
        // tslint:disable-next-line:variable-name
        let socket_url = '';
        if (url.indexOf('https') !== -1)
        {
            socket_url = url.replace('https', 'wss');
        }
        else
        {
            socket_url = url.replace('http', 'ws');
        }
        if (this._config.token)
            socket_url += '?token=' + this._config.token;

        return socket_url;
    }

    public getJitsiDomain() {
        const base_url = this._config.base_url;
        const chunks = base_url.split('//');
        const domain = 'call-' + chunks[1];
        return domain;
    }

    public getController(name: string)
    {
        return this._controllers[name];
    }

    public getProfile()
    {
        return this._config.profile;
    }

    public getNavigation()
    {
        return this._config.navigation;
    }

    public getTopNavigation()
    {
        return this._config.top_navigation;
    }

    public getDeployment()
    {
        return this._config.deployment;
    }

    public getPermission(name: string, slug: string)
    {
        if (this._config.permissions[slug] !== void 0)
        {
            if (name in this._config.permissions[slug])
            {
                return this._config.permissions[slug][name];
            }
        }

        return { name, permission: true };
    }

    getUrl()
    {
        return this._config.base_url;
    }

    // Encryption/Decryption

    public generateKeypair(passcode: string) {
        const rsaKeypair = KEYUTIL.generateKeypair('RSA', 1024);
        return {
            publicKey: KEYUTIL.getPEM(rsaKeypair.pubKeyObj),
            privateKey: KEYUTIL.getPEM(rsaKeypair.prvKeyObj, 'PKCS8PRV', passcode)
        }
    }

    private getPrivateKey(encrypted: string, passcode: string) {
        const prvKeyObj = KEYUTIL.getKeyFromEncryptedPKCS8PEM(encrypted, passcode);
        return KEYUTIL.getPEM(prvKeyObj, 'PKCS8PRV');
    }

    private getNewPrivateKey(encrypted: string, oldPasscode: string, newPasscode: string) {
        const prvKeyObj = KEYUTIL.getKeyFromEncryptedPKCS8PEM(encrypted, oldPasscode);
        const privateKey = KEYUTIL.getPEM(prvKeyObj, 'PKCS8PRV', newPasscode);
        return privateKey;
    }

    public  getIsSecurityEnabled(): boolean
    {
        return this._config.SecureModeEnabled;
    }

    public  getIsUserSecurityEnabled(): boolean
    {
        return this._config.UserSecurityEnabled;
    }

    InitEncryptor()
    {
        this.Encryptor = new JSEncrypt();
        this.Encryptor.setPublicKey(this._config.public_key);
    }

    InitDecryptor(passcode: string)
    {
        try {
            this.private_key = this.getPrivateKey(this._config.private_key, passcode);
        }
        catch (e) {
            localStorage.removeItem('security_code');
            this.securityCode = null;
            this.private_key = null;
            this.Decryptor = null;
            return false;
        }

        this.securityCode = passcode;
        localStorage.setItem('security_code', passcode);
        this.Decryptor = new JSEncrypt();
        this.Decryptor.setPrivateKey(this.private_key);

        const encryptText: string = this.encryptText('chi');
        const decryptText: string = this.decryptText(encryptText);

        console.log('decrypt text-> ', decryptText, encryptText, this.Decryptor.decrypt(encryptText));

        if ('chi' === decryptText)
        {
            return true;
        }
        else
        {
            this.private_key = null;
            this.Decryptor = null;
            return false;
        }
    }

    public getEncryptedKey(passcode: string)
    {
        return this.getNewPrivateKey(this._config.private_key, this.securityCode, passcode);
    }

    lockSecurity()
    {
        localStorage.removeItem('security_code');

        this.Decryptor = null;
        this.private_key = null;

        this.checkSecurity.next({type: 'CheckSecurity', row: null});
    }

    getIsSecurityUnlocked()
    {
        return this.Decryptor != null;
    }

    encryptText(text: string)
    {
        if (!this._config.SecureModeEnabled)
        {
            return text;
        }

        return this.Encryptor.encrypt(text);
    }

    decryptText(text: string)
    {
        if (!this._config.SecureModeEnabled)
        {
            return text;
        }
        else if (this.Decryptor == null)
        {
            RVAlertsService.error('Not Unlocked', '').subscribe(res=> {
                return text;
            });
        }

        return this.Decryptor.decrypt(text);
    }

    public gcmEnabled()
    {
        return this._config.GoogleNotificationEnable;
    }

    public getActiveClinic()
    {
        return this._config.clinic_id;
    }

    public isAnonymousUser()
    {
        return this._config.IsAnonymousUser;
    }

    public showSymptomChecker()
    {
        return this._config.SymptomChecker;
    }

    public setUserData(key: string, data: any): void
    {
        this._userData[key] = data;
    }

    public getUserData(key: string): any
    {
        if (this._userData[key] === void 0)
        {
            return null;
        }

        return this._userData[key];
    }
}
