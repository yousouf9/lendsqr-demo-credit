import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const formatDate = (dataString: string | Date): string => {
  return dayjs(dataString).format("YYYY-MM-DD");
};

export const formatDateTime = (dataString: string): string => {
  return dayjs(dataString).format("YYYY-MM-DD HH:mm:ss");
};

export const convertToDate = (date: string): Date => {
  return dayjs(date).toDate();
};

export const convertDateToUTC = (startTime: string | Date) => {
  const date = dayjs(`${startTime}`, "YYYY-MM-DD HH:mm");

  const DateInUTC = date.utc().toDate();

  return DateInUTC;
};
