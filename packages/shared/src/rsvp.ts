export enum RsvpStatus {
  PENDING = 'pending',
  ATTENDING = 'attending',
  NOT_ATTENDING = 'not_attending',
  MAYBE = 'maybe',
}

export enum InvitationChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
  LINK = 'link',
}

export enum InvitationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  OPENED = 'opened',
  RESPONDED = 'responded',
  REVOKED = 'revoked',
}
