/** Date-time picker values are entered in the client's India timezone. */
export const scheduledTime = (value: unknown): number => {
  const date = String(value ?? '');
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(date) ? date : `${date}+05:30`).getTime();
};
