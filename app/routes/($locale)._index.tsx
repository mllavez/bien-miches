import {AddToCalendarButton} from 'add-to-calendar-button-react';

import {LaunchForm} from '~/components/LuanchForm';
import {Countdown} from '~/components/Countdown';

export default function Homepage() {
  return (
    <div className="bg-first-hero-img bg-cover min-h-screen bg-center md:grid md:grid-cols-10 md:grid-rows-1 md:gap-0 justify-evenly justify-items-center content-evenly items-center md:py-28">
      <div className="p-6 pt-24 text-white flex flex-col justify-start items-center gap-5 max-w-sm container mx-auto md:max-w-[20.3rem] m md:items-start md:col-span-4 md:col-start-2 md:pt-0 md:p-0 md:items-start">
        <div className="flex-col justify-start items-center md:items-left md:text-left gap-2 inline-flex font-spooky">
          <h1 className="text-[3rem] font-native">FREE DRINK!</h1>
          <h2 className="text-4xl">SAT, 9/16/23 @ 5pm</h2>
          <h3 className="text-3xl md:text-3xl">907 Cedar St, Santa Cruz</h3>
        </div>
        <script
          async
          type="text/javascript"
          src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=TdNuBs"
        ></script>
        <div className="klaviyo-form-Vgu9b2 w-full"></div>
        <div className="w-full">
          <Countdown targetDate={new Date('September 16, 2023 17:00:00')} />
        </div>
        <button
          className="font-native h-[45px] py-2 bg-rose-700 rounded-lg justify-center items-center inline-flex w-full"
          onClick={() => {
            window.location.href =
              'https://www.google.com/maps/dir/?api=1&destination=Get%20Faded%20Barbershop,%201007%20Cedar%20St,%20Santa%20Cruz,%20CA%2095060';
          }}
        >
          DIRECTIONS
        </button>
        <AddToCalendarButton
          name="FREE DRINK! Independence Day - BIEN MICHES @ Get Faded Barbershop"
          startTime="17:00"
          endTime="20:00"
          startDate="2023-09-16"
          location="Get Faded Barbershop, 1007 Cedar St, Santa Cruz, CA 95060"
          options={['Apple', 'Google', 'iCal']}
        ></AddToCalendarButton>
        {/*<button className="font-native h-[45px] py-2 bg-rose-700 rounded-lg justify-center items-center inline-flex w-full">
          ADD TO CALENDAR
        </button> */}
      </div>

      <div className="flex justify-center md:col-span-3 md:col-start-7">
        <img
          src="https://cdn.shopify.com/s/files/1/0814/6478/7227/files/BienMiches_Outline.svg?v=1693602361"
          className="object-cover w-auto aspect-[166/305] height-[100%] max-w-[240px]"
          alt="Bien Miches Logo"
        />
      </div>
    </div>
  );
}
