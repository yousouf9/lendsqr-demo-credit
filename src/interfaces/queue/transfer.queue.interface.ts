import { Job, JobOptions, ProcessCallbackFunction } from "bull";

export interface ITransferQueue {
  add: (data: any, options?: JobOptions) => Promise<Job>;
  process: (callback: ProcessCallbackFunction<any>) => void;
}
