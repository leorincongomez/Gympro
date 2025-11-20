/**
 * calcAttendanceStats
 * - input: list of attendance records (with date/status)
 * - output: { totalDays, done, missed, percentDone }
 */
exports.calcAttendanceStats = (records, from, to) => {
  const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
  const done = records.filter(r => r.status === 'done').length;
  const missed = records.filter(r => r.status === 'missed').length;
  const percentDone = totalDays ? Math.round((done / totalDays) * 100) : 0;
  return { totalDays, done, missed, percentDone };
};