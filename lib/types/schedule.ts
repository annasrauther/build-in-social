export interface ScheduledVideo {
  videoId: string;
  title: string;
  platform: string;
  scheduledDay: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  scheduledTime?: string; // "HH:MM" 24h
  status: string;
}
