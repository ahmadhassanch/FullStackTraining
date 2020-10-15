import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
    templateUrl: './verification_status.component.html',
    styleUrls: ['./verification_status.component.scss']
})

export class VerificationStatusComponent implements OnInit
{
    responseMessage = 'An error has been occured while verifing your email, please try again.';
    emailVerified = false;
    constructor(private _route: ActivatedRoute)
    {
    }

    ngOnInit(): void
    {
        const status = this._route.snapshot.queryParamMap.get("status");

        if (status === 'success')
        {
            this.emailVerified = true;
        }
    }

}
