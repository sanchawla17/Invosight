import moment from "moment"; // date manipulation library

// input: ISO date string - "2023-10-05T14:48:00.000Z"
// output: "YYYY-MM-DD" format for input fields
export const formatDateInput = (value) => { 
  if (!value) {
    return "";
  }
  const date = moment(value);
  return date.isValid() ? date.format("YYYY-MM-DD") : "";
};

export const formatDateDisplay = (value) => {
  if (!value) {
    return "-";
  }
  const date = moment(value);
  return date.isValid() ? date.format("MMM D, YYYY") : "-";
};

// Format period label based on interval
export const formatPeriodLabel = (isoDate, interval) => {
  const date = moment(isoDate);
  if (!date.isValid()) {
    return "";
  }
  if (interval === "month") {
    return date.format("MMM YYYY");
  }
  if (interval === "week") {
    return `Wk ${date.isoWeek()}`;
  }
  return date.format("MMM D");
};
