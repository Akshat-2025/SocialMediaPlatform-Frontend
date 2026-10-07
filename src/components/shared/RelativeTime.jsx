"use client";

import { formatDistanceToNowStrict } from "date-fns";

export function RelativeTime({ date, className }) {
  if (!date) return null;
  return (
    <time className={className} dateTime={date} title={new Date(date).toLocaleString()}>
      {formatDistanceToNowStrict(new Date(date), { addSuffix: true })}
    </time>
  );
}
