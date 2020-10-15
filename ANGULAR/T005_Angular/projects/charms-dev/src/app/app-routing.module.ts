import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
    // {
    //     path: 'home',
    //     loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
    // },
    // {
    //     path: 'command_center',
    //     loadChildren: () => import('./pages/command_center/module').then(m => m.CommandCenterModule)
    // },
    // {
    //     path: 'onboarding',
    //     loadChildren: () => import('./pages/onboarding/module').then(m => m.PatientModule)
    // },
    // {
    //     path: 'hrm',
    //     loadChildren: () => import('./pages/hrm/module').then(m => m.HrmModule)
    // },
    // {
    //     path: 'appointments',
    //     loadChildren: () => import('./pages/appointments/module').then(m => m.AppointmentsModule)
    // },
    // {
    //     path      : '**',
    //     redirectTo: 'command_center'
    // }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
