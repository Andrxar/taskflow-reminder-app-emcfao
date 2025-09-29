
export interface Reminder {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  notificationId?: string;
}

export interface PostponeOption {
  label: string;
  minutes: number;
}

export const POSTPONE_OPTIONS: PostponeOption[] = [
  { label: '5 мин', minutes: 5 },
  { label: '10 мин', minutes: 10 },
  { label: '15 мин', minutes: 15 },
  { label: '30 мин', minutes: 30 },
  { label: '1 час', minutes: 60 },
  { label: '1 день', minutes: 1440 },
];
