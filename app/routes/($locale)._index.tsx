import {LaunchForm} from '~/components/LuanchForm';
import {Countdown} from '~/components/Countdown';

export default function Homepage() {
  return (
    <div className="bg-first-hero-img bg-cover h-screen bg-center">
      <div className="p-6 pt-24 text-white flex flex-col justify-start items-center gap-7">
        <div className="flex-col justify-start items-center gap-2 inline-flex font-spooky">
          <h1 className="text-[3rem] font-native">FREE DRINK!</h1>
          <h2 className="text-4xl">SAT, 9/16/23 @ 5pm</h2>
          <h3 className="text-3xl">907 Cedar St, Santa Cruz</h3>
        </div>
        <script
          async
          type="text/javascript"
          src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=TdNuBs"
        ></script>
        <div className="klaviyo-form-Vgu9b2 w-full"></div>
        <div>
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
        <div>
          {
            <script
              async
              type="text/javascript"
              src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=TdNuBs"
            ></script>
          }
        </div>
        <button className="font-native h-[45px] py-2 bg-rose-700 rounded-lg justify-center items-center inline-flex w-full">
          ADD TO CALENDAR
        </button>
      </div>
    </div>
  );
}
