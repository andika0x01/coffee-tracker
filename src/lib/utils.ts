import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("id");

export function formatDateTime(date: string | Date) {
  return dayjs.utc(date).tz("Asia/Jakarta").format("DD MMMM YYYY, HH:mm [WIB]");
}

export function formatDateOnly(date: string | Date) {
  return dayjs.utc(date).tz("Asia/Jakarta").format("DD MMMM YYYY");
}
