import {Routes, RouterModule} from '@angular/router';
import { NgModule} from '@angular/core';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/auth.module').then(m => m.AuthModule)
    },
    {
        path      : '**',
        redirectTo: ''
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
