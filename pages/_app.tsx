import NotificationList from "../components/NotificationList";
import { NotificationProvider } from "../provider/NotificationProvider";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
      <Component {...pageProps} />
      <NotificationList />
    </NotificationProvider>
  );
}
export default MyApp;
