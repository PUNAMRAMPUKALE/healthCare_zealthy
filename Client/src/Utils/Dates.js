import { addDays, addWeeks, addMonths, isAfter, isBefore, startOfDay, endOfDay, format, parseISO, isWithinInterval } from 'date-fns';

/**
 * Generate upcoming occurrences of a recurring appointment.
 * @param {Object} appointment - { datetime, repeat, end_date }
 * @param {Date} rangeStart - start of range
 * @param {Date} rangeEnd - end of range
 * @returns {Date[]} array of occurrence dates within the range
 */
export function getUpcomingOccurrences(appointment, rangeStart, rangeEnd) {
  const occurrences = [];
  const baseDate = parseISO(appointment.datetime);
  const endDate = appointment.end_date ? parseISO(appointment.end_date) : null;

  if (appointment.repeat === 'none' || !appointment.repeat) {
    if (isWithinInterval(baseDate, { start: rangeStart, end: rangeEnd })) {
      occurrences.push(baseDate);
    }
    return occurrences;
  }

  const advanceFn = appointment.repeat === 'weekly' ? addWeeks
    : appointment.repeat === 'monthly' ? addMonths
    : appointment.repeat === 'daily' ? addDays
    : null;

  if (!advanceFn) {
    if (isWithinInterval(baseDate, { start: rangeStart, end: rangeEnd })) {
      occurrences.push(baseDate);
    }
    return occurrences;
  }

  let current = baseDate;
  // Walk forward from baseDate
  let safety = 0;
  while (isBefore(current, rangeEnd) && safety < 500) {
    if (endDate && isAfter(current, endDate)) break;
    if (!isBefore(current, rangeStart)) {
      occurrences.push(current);
    }
    current = advanceFn(current, 1);
    safety++;
  }

  return occurrences;
}

/**
 * Generate upcoming refill dates for a prescription.
 */
export function getUpcomingRefills(prescription, rangeStart, rangeEnd) {
  const refills = [];
  const baseDate = parseISO(prescription.refill_on);

  const advanceFn = prescription.refill_schedule === 'weekly' ? addWeeks
    : prescription.refill_schedule === 'monthly' ? addMonths
    : prescription.refill_schedule === 'daily' ? addDays
    : null;

  if (!advanceFn) {
    if (isWithinInterval(baseDate, { start: rangeStart, end: rangeEnd })) {
      refills.push(baseDate);
    }
    return refills;
  }

  let current = baseDate;
  let safety = 0;
  while (isBefore(current, rangeEnd) && safety < 500) {
    if (!isBefore(current, rangeStart)) {
      refills.push(current);
    }
    current = advanceFn(current, 1);
    safety++;
  }

  return refills;
}

export function formatDate(dateStr) {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDateTime(dateStr) {
  return format(parseISO(dateStr), 'MMM d, yyyy · h:mm a');
}

export function formatTime(dateStr) {
  return format(parseISO(dateStr), 'h:mm a');
}
