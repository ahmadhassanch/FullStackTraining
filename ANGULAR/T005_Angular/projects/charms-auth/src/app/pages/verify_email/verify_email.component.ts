import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    templateUrl: './verify_email.component.html',
    styleUrls: ['./verify_email.component.scss']
})

export class VerifyEmailComponent implements OnInit
{
    user_email: any = null;
    loginUrl = '';
    constructor(private _router: Router, private _route: ActivatedRoute)
    {
    }

    ngOnInit(): void
    {
        this.user_email = this._route.snapshot.queryParamMap.get("email");
        if (this.user_email == null)
        {
            this._router.navigateByUrl('/signup');
        }
    }

}
