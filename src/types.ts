export interface WaitingAppointment {
  WaitingAppointmentId: string,
  PlaceInQueue: number,
  PlaceInQueueString: string,
  CanConfirm: boolean,
  CanCancel: boolean,
  Id: string,
  Email: string,
  FullName: string,
  PhoneNumber: string,
  ScheduledDateTimeString: string,
  ApplicantId: string,
  ServiceProviderCode: string,
  ServiceId: string,
  ServiceName: string,
  ServiceAlternativeName: string,
  Payload: string
}

export interface WaitingAppointments {
  Items: WaitingAppointment[],
  Count: number
}

export interface Confirmation {
  ErrorMessage: string | null,
  IsSuccessful: boolean,
}

export interface MonthScheduleDay {
    Date: string,
    ScheduledAppointmentsCount: number,
    ApplicationsDailyLimit: number,
    BlockedByMeCount: number,
    AvailableAppointmentsCount: number
}

export interface MonthScheduleMonth {
  Days: MonthScheduleDay[],
  Month: number,
  Year: number
}

export interface MonthScheduleResponse {
  Error: string | null,
  ServiceId: string,
  Month: MonthScheduleMonth,
  TotalSlots: number,
  AvailableSlots: number,
  ReserevedByYouCount: number,
}