import React from 'react';

import {useCountdown} from '~/hooks/useCountdown';

const ShowCounter = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  return (
    <div className="show-counter grid grid-cols-4 justify-between max-w-sm pt-10 pb-4">
      <div className="flex flex-col justify-center">
        <p className="font-spooky text-5xl text-center">{days}</p>
        <span className="text-center font-native">Days</span>
      </div>
      <div className="flex flex-col justify-center">
        <p className="font-spooky text-5xl text-center">{hours}</p>
        <span className="text-center font-native">Hours</span>
      </div>
      <div className="flex flex-col justify-center text-center">
        <p className="font-spooky text-5xl text-center">{minutes}</p>
        <span className="text-center font-native">Mins</span>
      </div>
      <div className="flex flex-col justify-center">
        <p className="font-spooky text-5xl text-center">{seconds}</p>
        <span className="text-center font-native">Seconds</span>
      </div>
    </div>
  );
};

export function Countdown({targetDate}: {targetDate: Date}) {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  if (days + hours + minutes + seconds <= 0) {
    return <h2>Done</h2>;
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
}
