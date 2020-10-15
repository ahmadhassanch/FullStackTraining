import { Optional } from '@angular/core';
import { NgModule } from '@angular/core';
import { SkipSelf } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';


import { FUSE_CONFIG } from './services';

@NgModule()
export class FuseModule
{
    constructor(@Optional() @SkipSelf() parentModule: FuseModule)
    {
        if ( parentModule )
        {
            throw new Error('FuseModule is already loaded. Import it in the AppModule only!');
        }
    }

    static forRoot(config): ModuleWithProviders<FuseModule>
    {
        return {
            ngModule : FuseModule,
            providers: [
                {
                    provide : FUSE_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
