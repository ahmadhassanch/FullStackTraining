import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { ChiConfigService } from 'charms-lib';


@Injectable()
export class AppRoutesGuard implements CanActivate
{
    constructor(public router: Router, private configService: ChiConfigService) {
        
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean 
    {
        if (state.hasOwnProperty('url')) 
        {
            let isFound: boolean = false;
            const url: string = state.url;

            for (let r of this.configService.getNavigation()) 
            {
                isFound = this.checkRoute(r, url);
                if (isFound) 
                {
                    break
                }
            }

            if (isFound)
            {
                return true;
            }
            else
            {
                for (let tn of this.configService.getTopNavigation()) 
                {
                    isFound = this.checkRoute(tn, url);
                    if (isFound) 
                    {
                        break
                    }

                }

                if (isFound)
                {
                    return true;
                }

                else if (!isFound) 
                {
                    let link = this.getHomeRoute();
                    this.router.navigate([link]);
                }

                // else if (!isFound && url === "" || url === '/command_center/unhandled_observations') 
                // {
                //     let link = this.getHomeRoute();
                //     this.router.navigate([link]);
                // }

                console.error('401 UnAuthorized', 'you’re just not supposed to access this particular page.');
                // RVAlertsService.error('401 UnAuthorized', 'you’re just not supposed to access this particular page.');
                return false;
            }
        }

        else 
        {
            // RVAlertsService.error('401 UnAuthorized', 'you’re just not supposed to access this particular page.');
            return true;
        }
    }

    checkRoute(r: any, url: string): boolean
    {
        let isFound: boolean = false;
        if (r.hasOwnProperty('children') && r.children.length > 0 && r.visible) 
        {
            for (let c of r.children) 
            {
                if (c.visible && c.url === url) 
                {
                    isFound = true;
                }    
            }
        }
        else if (r.hasOwnProperty('children') && r.children.length === 0 && r.visible && r.url === url) 
        {
            isFound = true;
        }

        return isFound;
    }

    getHomeRoute() {
        for (let r of this.configService.getNavigation()) 
        {
            if (r.hasOwnProperty('children') && r.children.length > 0) {
                for (let sub of r.items) {
                    if (sub.visible)
                        return sub.url;
                }
            }

            else if (r.hasOwnProperty('children') && r.children.length === 0 && r.visible) {
                return r.url;
            }
        }
    }
}