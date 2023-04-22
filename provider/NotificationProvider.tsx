import { createNotificationContext } from "react-notification-provider";

interface Notification {
  message: string;
  description?: string;
  duration?: number;
  level: "success" | "error" | "info";
}

const { NotificationProvider, useNotificationQueue } =
  createNotificationContext<Notification>();

export { NotificationProvider, useNotificationQueue };
