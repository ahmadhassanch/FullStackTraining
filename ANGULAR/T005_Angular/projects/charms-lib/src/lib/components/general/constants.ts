export class Constants
{
    static readonly JitsiDomain = 'tcoms20.cognitivehealthintl.com';

    static readonly StartOutGoing = 'StartOutGoingCall';
    static readonly IncomingCall = 'PN_EVENT_INCOMING';
    static readonly CCIncomingCall = 'PN_EVENT_CC_INCOMING';

    static readonly UserBusy = 'PN_EVENT_USER_BUSY';
    static readonly CallRejected = 'PN_EVENT_USER_REJECTED';
    static readonly CallEnded = 'PN_EVENT_CALL_ENDED';
    static readonly CallExpired = 'PN_EVENT_CALL_EXPIRED';

    static readonly CallAnswered = 'PN_EVENT_CALL_ACCEPTED';
    static readonly CallConnected = 'PN_EVENT_CALL_CONNECTED';
    static readonly CallWaiting = 'PN_EVENT_CALL_WAITING';

    static readonly NoOneAvailable = 'PN_EVENT_NO_ONE_AVAILABLE';
    static readonly CallNoResponse = 'PN_EVENT_CALL_NO_RESPONSE';
    static readonly NotOnline = 'PN_EVENT_NOT_ONLINE';

    static readonly UserNotAvailable = 'PN_USER_STATUS_NOT_AVAILABLE';

    static readonly ACTION_CALL_CC = 'ACTION_CALL_CC';
    static readonly ACTION_CALL_USER = 'ACTION_CALL_USER';
    static readonly ACTION_CALL_INVITE = 'ACTION_CALL_INVITE';
    static readonly ACTION_CALL_ACCEPT = 'ACTION_CALL_ACCEPT';
    static readonly ACTION_CALL_REJECT = 'ACTION_CALL_REJECT';
    static readonly ACTION_CALL_END = 'ACTION_CALL_END';
    static readonly ACTION_CALL_ACKNOWLEDGE = 'ACTION_CALL_ACKNOWLEDGE';
    static readonly ACTION_CALL_PING = 'ACTION_CALL_PING';


    // Device Status
    static readonly CHECKED_IN = 'Checked In';
    static readonly CHECKED_OUT = 'Checked Out';

    // Vital Catergory
    static readonly VITAL = 'Vital';
    static readonly HOMECARE = 'Homecare';
    static readonly MEDICATION = 'Medication';
    static readonly PILL_DISPENSER = 'PillDispenser';
    static readonly REPORT = 'Report';
    static readonly MESSAGE = 'Message';
    static readonly LABORATORY = 'Laboratory';

    // Advance Custom Schedule
    static readonly ONCE = 'Once';
    static readonly REPEAT = 'Repeat';
    static readonly DAILY = 'Daily';
    static readonly WEEKLY = 'Weekly';
    static readonly MONTHLY = 'Monthly';
    static readonly CUSTOM = 'Custom';
    static readonly DAY = 'Day';
    static readonly WEEK = 'Week';
    static readonly MONTH = 'Month';

    static readonly END_TYPE_OCCURRENCES = 'Occurrences';
    static readonly END_TYPE_NEVER = 'Never';
    static readonly END_TYPE_END_DATE = 'EndDate';
    static readonly END_TYPE_DAYS = 'Days';
    static readonly END_TYPE_WEEKS = 'Weeks';
    static readonly END_TYPE_MONTHS = 'Months';
    static readonly END_TYPE_CUSTOM = 'Custom';

    // Stethoscope Resultables
    static readonly STH_LUNGS_POSTERIOR = 'STH_LUNGS_POSTERIOR';
    static readonly STH_LUNGS_ANTERIOR = 'STH_LUNGS_ANTERIOR';
    static readonly STH_HEART = 'STH_HEART';

}