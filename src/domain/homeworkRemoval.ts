export const confirmHomeworkRemoval = (title: string, confirm: (message: string) => boolean) =>
  confirm(`Delete “${title}”? This cannot be undone.`)
