import { useNotificationQueue } from "../../provider/NotificationProvider";
import Notification from "./Notification";

export default function NotificationList() {
  const queue = useNotificationQueue();

  return (
    <div className="fixed top-0 z-30 flex flex-col items-center w-full gap-4">
      {queue.entries.map(({ id, data }) => (
        <Notification key={id} id={id} {...data} />
      ))}
    </div>
  );
}
