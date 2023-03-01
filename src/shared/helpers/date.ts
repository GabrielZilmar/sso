const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export default class DateHelper {
  public static addHour(date = new Date(), hour = HOUR_IN_MILLISECONDS): Date {
    const dateInTimestamp = date.getTime();

    const timeAdded = dateInTimestamp + hour;
    return new Date(timeAdded);
  }
}
