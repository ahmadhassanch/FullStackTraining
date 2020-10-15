import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs';
import { ChiConfigService } from '../services';


@Pipe({name: 'decrypt$', pure: false})
export class DecryptionPipe implements PipeTransform
{
    /**
     * Transform
     *
     * @param value
     * @param {string[]} args
     * @returns {any}
     */

    constructor(private _configService: ChiConfigService)
    {
    }
    
    transform(val: any, args?: any): Observable<any>
    {
        if (this._configService.getIsSecurityEnabled())
        {
            if (this._configService.getIsSecurityUnlocked())
            {
                // for all other type other than patient name
                if (args !== void 0 && args !== null && args.hasOwnProperty('pipe_type') && args['pipe_type'] === 'encrypted')
                {
                    const key: string = args['key'] + '_enc'; 
                    const dec_data: string = this.getValue(key, val);
                    return of(dec_data);
                }

                // only for patient name
                else
                {
                    const seperator: string = args === 'type_array' ? '%' : ' ';
                    const full_name: string = this.getValue('first_name_enc', val) + seperator + this.getValue('last_name_enc', val);
                    
                    if (args === 'type_array')
                    {
                        return of(full_name.split(""));
                    }
                    return of(full_name);

                }
            }
            else
            {
                if (args === 'type_array')
                {
                    return of('--%--'.split(""));
                }
                return of('-- --');
            }
        }
        else
        {

            if (args !== void 0 && args.hasOwnProperty('pipe_type') && args['pipe_type'] === 'encrypted')
            {
                return of(this.getDefaultValue(val, args, args['key']));
            }
            else 
            {
                return of(this.getDefaultValue(val, args, 'full_name'));
            }
        }
    }

    getValue(key: string, obj: any)
    {
        if (obj !== void 0 && obj.hasOwnProperty(key))
        {
            const enck =  obj[key] + '_dec';
            if (obj[enck] !== void 0)
            {
                return obj[enck] === null ? '' : obj[enck];
            }
            
            const v = this._configService.decryptText(obj[key]);
            obj[enck] = v;
            return v === null ? '' : v;
        } 
        else
        {
          return '';  
        }
    }

    getDefaultValue(obj: any, args: string, key: string)
    {
        if (obj !== void 0 && obj !== null)
        {
            if ( args === 'type_array')
            {
                let full_name: string = '';
                if (obj.hasOwnProperty('first_name'))
                {
                    full_name = obj.first_name;
                }

                if (obj.hasOwnProperty('last_name'))
                {
                    full_name = full_name + '%' + obj.last_name;
                }

                return full_name.split("");
            }
            else
            {
                let default_val: string = '';
                if (obj.hasOwnProperty(key))
                {
                    default_val = obj[key];
                }
                
                return default_val;
            }
        } 
        else
        {
          return '';  
        }
    }
}