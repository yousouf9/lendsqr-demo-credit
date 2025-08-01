import { Status } from "./status";

interface SuccessMessage {
  status: Status;
  data?: any;
  message?: string;
  code?: string;
}
export function successResponse(
  data?: any,
  message?: string,
  code?: string
): SuccessMessage {
  return {
    status: Status.Success,
    data,
    message,
    code,
  };
}
