export function getEgyptTodayIso() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo"
  }).format(new Date());
}

export function getMonthKey(value: string) {
  return value.slice(0, 7);
}
