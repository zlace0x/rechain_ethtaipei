import { useCallback, useEffect } from "react";
import { useNotificationQueue } from "../../../provider/NotificationProvider";

const notificationLevelStyle = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
};
interface Notification {
  id: string;
  message: string;
  description?: string;
  duration?: number;
  level: keyof typeof notificationLevelStyle;
}
export default function Notification({
  id,
  message,
  description,
  duration,
  level,
}: Notification) {
  const queue = useNotificationQueue();
  const removeNotification = useCallback(() => queue.remove(id), [id, queue]);

  useEffect(() => {
    const timer = setTimeout(removeNotification, duration || 5 * 1000);
    return () => clearTimeout(timer);
  }, [duration, removeNotification]);

  return (
    <div className="fixed inset-x-0 flex items-end px-4 py-6 pointer-events-none sm:bottom-0 sm:items-start sm:p-6 left-10">
      <div
        className={`flex flex-col items-center space-y-4 border rounded-lg sm:items-end bg-gray-50 ${notificationLevelStyle[level]}`}
      >
        <div className="p-2 w-60">{message}</div>
      </div>
    </div>
  );
}
