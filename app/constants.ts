import {FounderId,MeetingType} from './types';
export const FOUNDERS:{id:FounderId;name:string}[]=[{id:'raj',name:'Raj'},{id:'yola',name:'Yola'},{id:'carl',name:'Carl'},{id:'juan',name:'Juan'}];
export const MEETING_TYPES:{value:MeetingType;label:string}[]=[['google-meet','Google Meet'],['zoom','Zoom'],['teams','Teams'],['discord','Discord'],['signal','Signal'],['whatsapp','WhatsApp'],['phone','Phone'],['in-person','In Person'],['other','Other']].map(([value,label])=>({value:value as MeetingType,label}));
