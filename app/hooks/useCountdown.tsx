import {useEffect, useState} from 'react';
type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};
const calculateTimeLeft = (targetDate: Date) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {} as TimeLeft;
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

export function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
  });
  return Object.values(timeLeft);
}
