export const ApiEvents = {
  // System
  SystemGetInfo: 'system:getInfo',

  // Dialog
  DialogSelectFolder: 'dialog:selectFolder',

  // Counter
  CounterGet: 'counter:get',
  CounterIncrement: 'counter:increment',
  CounterChanged: 'counter:changed',

  // Clock
  ClockSetRunning: 'clock:setRunning',
  ClockTick: 'clock:tick',

  // Git
  GitGetGraph: 'git:getGraph',
} as const;

export type ApiEventValues = (typeof ApiEvents)[keyof typeof ApiEvents];
