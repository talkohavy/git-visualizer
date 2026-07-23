import { ApiEvents } from '@root/common/constants';
import type { SystemInfo } from '@root/common/types';

export type InvokeSchema = {
  [ApiEvents.SystemGetInfo]: { args: []; result: SystemInfo };
  [ApiEvents.DialogSelectFolder]: { args: []; result: string | null };
  [ApiEvents.CounterGet]: { args: []; result: number };
};

export type SendSchema = {
  [ApiEvents.CounterIncrement]: { args: [by: number] };
  [ApiEvents.ClockSetRunning]: { args: [running: boolean] };
};

export type EventSchema = {
  [ApiEvents.CounterChanged]: number;
  [ApiEvents.ClockTick]: number;
};
