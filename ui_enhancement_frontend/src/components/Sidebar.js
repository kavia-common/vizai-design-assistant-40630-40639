import React, { useMemo, useState } from 'react';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useFilters } from '../context/FilterContext';

/** Species options placeholder; in real app fetched from backend */
const SPECIES = ['Dolphin','Whale','Shark','Turtle','Seal'];

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Persistent left sidebar for Species and Date Range with Apply/Reset */
  const { filters, apply, reset } = useFilters();
  const [localSpecies, setLocalSpecies] = useState(filters.species || []);
  const [range, setRange] = useState([{
    startDate: filters.dateRange?.startDate || addDays(new Date(), -7),
    endDate: filters.dateRange?.endDate || new Date(),
    key: 'selection'
  }]);

  const formatted = useMemo(() => ({
    startDate: range[0].startDate,
    endDate: range[0].endDate
  }), [range]);

  const toggleSpecies = (s) => {
    setLocalSpecies(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const onApply = () => {
    apply({
      ...filters,
      species: localSpecies,
      dateRange: formatted
    });
  };

  const onReset = () => {
    setLocalSpecies([]);
    setRange([{
      startDate: addDays(new Date(), -7),
      endDate: new Date(),
      key: 'selection'
    }]);
    reset();
  };

  return (
    <aside className="sidebar" aria-label="Filters sidebar">
      <div className="title">Filters</div>
      <div className="subtitle">Refine by species and dates</div>

      <div className="card" role="region" aria-labelledby="species-label">
        <div id="species-label" className="label">Species</div>
        <div className="flex gap-8" role="group" aria-label="Species multi select">
          {SPECIES.map(s => (
            <button
              key={s}
              className="btn"
              aria-pressed={localSpecies.includes(s)}
              onClick={() => toggleSpecies(s)}
              onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleSpecies(s);} }}
            >
              {localSpecies.includes(s) ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
      </div>

      <div className="card" role="region" aria-labelledby="date-range-label">
        <div id="date-range-label" className="label">Date Range</div>
        <DateRange
          ranges={range}
          onChange={(item) => setRange([item.selection])}
          moveRangeOnFirstSelection={false}
          editableDateInputs
          ariaLabels={{
            dateInput: { startDate: 'Start date', endDate: 'End date' },
            monthPicker: 'Month picker',
            yearPicker: 'Year picker'
          }}
        />
        <div className="hint">
          Selected: {formatted.startDate.toLocaleDateString()} - {formatted.endDate.toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-12">
        <button className="btn btn-primary" onClick={onApply} aria-label="Apply filters">Apply</button>
        <button className="btn" onClick={onReset} aria-label="Reset filters">Reset</button>
      </div>
    </aside>
  );
}
