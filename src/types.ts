export interface WaitingAppointment {
  WaitingAppointmentId: string,
  PlaceInQueue: number,
  PlaceInQueueString: string, //'На согласовании'
  CanConfirm: boolean,
  CanCancel: boolean,
  Id: string, // '33c1c221-57fa-4c90-a1c6-58cac04aff9c',
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

/*

{
  "Error": null,
  "ServiceId": "bb064812-a917-248e-d17c-2cf57b9f8cb2",
  "Month": {
    "Days": [
      {
        "Date": "/Date(1665360000000)/",
        "ScheduledAppointmentsCount": 30,
        "ApplicationsDailyLimit": 30,
        "BlockedByMeCount": 0,
        "AvailableAppointmentsCount": 0
      },
      {
        "Date": "/Date(1665446400000)/",
        "ScheduledAppointmentsCount": 20,
        "ApplicationsDailyLimit": 20,
        "BlockedByMeCount": 0,
        "AvailableAppointmentsCount": 0
      },
      {
        "Date": "/Date(1665532800000)/",
        "ScheduledAppointmentsCount": 20,
        "ApplicationsDailyLimit": 20,
        "BlockedByMeCount": 0,
        "AvailableAppointmentsCount": 0
      },
      {
        "Date": "/Date(1665619200000)/",
        "ScheduledAppointmentsCount": 20,
        "ApplicationsDailyLimit": 20,
        "BlockedByMeCount": 0,
        "AvailableAppointmentsCount": 0
      },
      {
        "Date": "/Date(1665705600000)/",
        "ScheduledAppointmentsCount": 12,
        "ApplicationsDailyLimit": 12,
        "BlockedByMeCount": 0,
        "AvailableAppointmentsCount": 0
      },
      {
        "Date": "/Date(1665964800000)/",
        "ScheduledAppointmentsCount": 30,
        "ApplicationsDailyLimit": 30,
        "BlockedByMeCount": 0,
        "AvailableAppointmentsCount": 0
      }
    ],
    "Year": 2022,
    "Month": 10
  },
  "TotalSlots": 132,
  "AvailableSlots": 0,
  "ReserevedByYouCount": 0
}
*/