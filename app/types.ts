export type FounderId = 'raj'|'yola'|'carl'|'juan';
export type MeetingType = 'google-meet'|'zoom'|'teams'|'discord'|'signal'|'whatsapp'|'phone'|'in-person'|'other';
export type MeetingOutcome = 'achieved'|'partial'|'follow-up'|'rescheduled';
export type Meeting={id:number;date:string;time:string;title:string;subtitle:string;purpose:string;founderIds:FounderId[];externalParticipants:string;meetingType:MeetingType;destination:string;outcome?:MeetingOutcome};
