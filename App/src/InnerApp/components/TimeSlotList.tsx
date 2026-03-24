import React from "react";
import { Calendar as CalendarIcon, Sunrise, Sun, Sunset } from "lucide-react";

interface TimeSlotListProps {
  /** Array of available times in minutes from midnight */
  times: number[];
  /** Currently selected time values (as string minutes) */
  selectedValues: string[];
  /** Whether multiple selection is allowed */
  multiSelect?: boolean;
  /** Callback when a time slot is toggled */
  onSelect: (value: string) => void;
  /** Format a minute value into display string */
  formatTime: (minutes: number) => string;
  /** Label shown when no date is selected */
  emptyLabel?: string;
  /** Label shown above the list */
  title?: string;
}

interface TimeGroup {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  times: number[];
  color: string;
}

/**
 * Reusable time slot list with day-part grouping (Morning / Afternoon / Evening).
 * Follows the Booking page design with gradient pills and glass borders.
 */
const TimeSlotList: React.FC<TimeSlotListProps> = ({
  times,
  selectedValues,
  multiSelect: _multiSelect = false,
  onSelect,
  formatTime,
  emptyLabel = "Pick a date",
  title = "Available Times",
}) => {
  const groupedTimes = React.useMemo<TimeGroup[]>(() => {
    const morning = times.filter((m) => m < 720);
    const afternoon = times.filter((m) => m >= 720 && m < 1020);
    const evening = times.filter((m) => m >= 1020);
    return [
      { label: "Morning", icon: Sunrise as any, times: morning, color: "from-amber-400 to-orange-400" },
      { label: "Afternoon", icon: Sun as any, times: afternoon, color: "from-yellow-400 to-amber-500" },
      { label: "Evening", icon: Sunset as any, times: evening, color: "from-indigo-400 to-purple-500" },
    ].filter((g) => g.times.length > 0);
  }, [times]);

  return (
    <>
      <h4 className="text-base font-semibold text-content-inverse mb-3">
        {times.length > 0 ? title : "Select a Date"}
      </h4>

      <div className="space-y-4 px-1 lg:overflow-y-auto lg:flex-1 lg:min-h-0 lg:pr-2 custom-scrollbar">
        {times.length > 0 ? (
          groupedTimes.map(({ label, icon: Icon, times: groupTimes, color }) => (
            <div key={label}>
              {/* Day-part header */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-content-subtle-inverse">
                  {label}
                </span>
                <div className="flex-1 h-px bg-line-glass/50" />
              </div>

              {/* Slots */}
              <ul className="space-y-1.5">
                {groupTimes.map((timeInMinutes) => {
                  const val = timeInMinutes.toString();
                  const isSelected = selectedValues.includes(val);
                  return (
                    <li key={timeInMinutes}>
                      <button
                        className={`w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                          ${isSelected
                            ? "bg-gradient-to-r from-brand to-accent-teal text-white shadow-lg shadow-brand/30 scale-[1.02]"
                            : "bg-surface-elevated/50 text-content-inverse border border-line-glass hover:bg-brand/20 hover:border-brand/30"
                          }`}
                        onClick={() => onSelect(val)}
                      >
                        {formatTime(timeInMinutes)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <CalendarIcon className="w-10 h-10 text-content-subtle-inverse/40 mb-2" />
            <p className="text-content-subtle-inverse text-sm">{emptyLabel}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TimeSlotList;
