import { FuseNavigation } from 'charms-lib';


export const navigation: FuseNavigation[] = [
    {
        id       : 'dashboard',
        title    : 'Dashboard',
        type     : 'item',
        icon     : 'dashboard',
        url      : '/home/dashboard',
        children : []
    },
    {
        id       : 'datacentre',
        title    : 'Command Centre',
        type     : 'collapsable',
        icon     : 'dashboard',
        badge    : {
            title: '20',
            bg: 'red',
            fg: 'white'
        },
        children : [
            {
                id       : 'observation',
                title    : 'Observations',
                type     : 'item',
                url      : '/command_center/observations'
            },
            {
                id       : 'ongoing_session',
                title    : 'Ongoing Sessions',
                type     : 'item',
                url      : '/command_center/ongoing_sessions'
            },
            {
                id       : 'messages',
                title    : 'Messages',
                type     : 'item',
                url      : '/command_center/messages/all'
            },
            {
                id       : 'calls',
                title    : 'Calls History',
                type     : 'item',
                url      : '/command_center/calls'
            },
            {
                id       : 'call_recordings',
                title    : 'Calls Recordings',
                type     : 'item',
                url      : '/command_center/call_recordings'
            },
            {
                id       : 'patient_schedules',
                title    : 'Patient Schedules',
                type     : 'item',
                url      : '/command_center/patient_schedules'
            }
        ]
    },
    {
        id       : 'datacentre',
        title    : 'Onboarding',
        type     : 'collapsable',
        icon     : 'dashboard',
        children : [
            {
                id       : 'patients',
                title    : 'Patients',
                type     : 'item',
                url      : '/onboarding/patients'
            },
            {
                id       : 'episodes',
                title    : 'Episodes',
                type     : 'item',
                url      : '/onboarding/episodes'
            },
            {
                id       : 'medication_management',
                title    : 'Medication Management',
                type     : 'item',
                url      : '/onboarding/medication_management'
            },
        ]
    },
    {
        id       : 'datacentre',
        title    : 'HRM',
        type     : 'collapsable',
        icon     : 'people',
        children : [
            {
                id       : 'employeees',
                title    : 'Employees',
                type     : 'item',
                url      : '/hrm/employees'
            },
        ]
    },
    {
        id       : 'appointments',
        title    : 'Appointments',
        type     : 'item',
        icon     : 'event_available',
        url      : '/appointments',
        children : []
    },
];
