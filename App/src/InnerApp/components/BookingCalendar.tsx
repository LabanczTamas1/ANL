import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface BookingCalendarProps {
  value: Date | null;
  activeStartDate: Date;
  onChange: (value: Value) => void;
  onActiveStartDateChange: (date: Date) => void;
}

/**
 * Styled calendar component matching the Booking page design.
 * Uses the design-system glass/brand tokens.
 */
const BookingCalendar: React.FC<BookingCalendarProps> = ({
  value,
  activeStartDate,
  onChange,
  onActiveStartDateChange,
}) => (
  <>
    <Calendar
      className="booking-calendar !bg-transparent !w-full !border-none min-h-[320px] lg:!h-full"
      tileClassName={() => `
        !rounded-xl !transition-all !duration-200
        hover:!bg-brand/30 hover:!text-white
        focus:!bg-brand focus:!text-white
        !text-content-inverse
      `}
      tileContent={({ date }) =>
        date.toDateString() === new Date().toDateString()
          ? <span className="booking-today-label">Today</span>
          : null
      }
      onChange={onChange}
      value={value}
      activeStartDate={activeStartDate}
      view="month"
      onActiveStartDateChange={({ activeStartDate: d }) =>
        onActiveStartDateChange(d || new Date())
      }
      showNeighboringMonth
      navigationLabel={({ date }) => (
        <span className="text-lg font-semibold text-content-inverse">
          {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
      )}
      nextLabel={<span className="text-content-inverse hover:text-brand-hover transition-colors">&rsaquo;</span>}
      prevLabel={<span className="text-content-inverse hover:text-brand-hover transition-colors">&lsaquo;</span>}
      next2Label={null}
      prev2Label={null}
    />

    <style>{`
      .booking-calendar .react-calendar__navigation {
        background: transparent;
        margin-bottom: 1rem;
      }
      .booking-calendar .react-calendar__navigation button {
        color: white;
        font-size: 1.5rem;
        background: transparent;
      }
      .booking-calendar .react-calendar__navigation button:hover {
        background: rgba(101, 85, 143, 0.2);
        border-radius: 0.75rem;
      }
      .booking-calendar .react-calendar__month-view__weekdays {
        color: #A5A5A5;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
      }
      .booking-calendar .react-calendar__month-view__weekdays abbr {
        text-decoration: none;
      }
      .booking-calendar .react-calendar__tile {
        padding: 0.6rem 0.4rem;
        background: transparent;
      }
      .booking-calendar .react-calendar__tile--now,
      .booking-calendar .react-calendar__tile--now:enabled {
        background: rgba(101, 85, 143, 0.15) !important;
        position: relative;
        padding-top: 1.1rem !important;
        border: 1px solid rgba(101, 85, 143, 0.35) !important;
      }
      .booking-calendar .react-calendar__tile--now:enabled:hover {
        background: rgba(101, 85, 143, 0.30) !important;
        position: relative;
        padding-top: 1.1rem !important;
      }
      .booking-calendar .react-calendar__tile--now:enabled:focus {
        background: rgba(101, 85, 143, 0.30) !important;
        position: relative;
        padding-top: 1.1rem !important;
      }
      .booking-calendar .react-calendar__tile--now.react-calendar__tile--active,
      .booking-calendar .react-calendar__tile--now.react-calendar__tile--active:enabled,
      .booking-calendar .react-calendar__tile--now.react-calendar__tile--active:enabled:hover,
      .booking-calendar .react-calendar__tile--now.react-calendar__tile--active:enabled:focus {
        background: linear-gradient(135deg, #65558F 0%, #7AA49F 100%) !important;
        color: white !important;
        font-weight: 600;
        border: none !important;
      }
      .booking-today-label {
        position: absolute;
        top: 3px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 7px;
        font-weight: 700;
        color: #7AA49F;
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        pointer-events: none;
      }
      .booking-calendar .react-calendar__tile--active,
      .booking-calendar .react-calendar__tile--active:enabled,
      .booking-calendar .react-calendar__tile--active:enabled:hover,
      .booking-calendar .react-calendar__tile--active:enabled:focus,
      .booking-calendar .react-calendar__tile--hasActive,
      .booking-calendar .react-calendar__tile--hasActive:enabled,
      .booking-calendar .react-calendar__tile--hasActive:enabled:hover,
      .booking-calendar .react-calendar__tile--hasActive:enabled:focus {
        background: linear-gradient(135deg, #65558F 0%, #7AA49F 100%) !important;
        color: white !important;
        font-weight: 600;
      }
      .booking-calendar .react-calendar__month-view__days__day--neighboringMonth {
        color: #4B5563 !important;
      }
    `}</style>
  </>
);

export default BookingCalendar;
