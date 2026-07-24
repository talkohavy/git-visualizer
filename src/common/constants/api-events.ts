export const ApiEvents = {
  // Dialog
  DialogSelectFolder: 'dialog:selectFolder',

  // Git
  GitGetGraph: 'git:getGraph',
} as const;

export type ApiEventValues = (typeof ApiEvents)[keyof typeof ApiEvents];
