import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import { useFilters } from '../context/FilterContext';
import { apiDownload } from '../utils/api';
import { toast } from 'react-toastify';

const BEHAVIORS = ['Feeding','Breaching','Traveling','Resting','Socializing'];

// PUBLIC_INTERFACE
export default function Reports() {
  /** Reports builder with behavior multi-select, date range, hours min/max, and export actions. */
  const { filters } = useFilters();
  const [behaviors, setBehaviors] = useState(filters.behaviors || []);
  const [hours, setHours] = useState({ min: 0, max: 24 });
  const [range, setRange] = useState([{
    startDate: filters.dateRange?.startDate || addDays(new Date(), -7),
    endDate: filters.dateRange?.endDate || new Date(),
    key: 'selection'
  }]);

  const toggleBehavior = (b) => {
    setBehaviors(prev => prev.includes(b) ? prev.filter(x=>x!==b) : [...prev,b]);
  };

  const submit = async (fmt) => {
    if (hours.min < 0 || hours.max > 24 || hours.min > hours.max) {
      toast.error('Please provide valid hour range (0-24).');
      return;
    }
    const payload = {
      species: filters.species,
      behaviors,
      start: range[0].startDate.toISOString(),
      end: range[0].endDate.toISOString(),
      hours
    };
    const res = await apiDownload(fmt === 'excel' ? '/reports/export/excel' : '/reports/export/pdf', payload, fmt);
    if (res) {
      const a = document.createElement('a');
      a.href = res.blobUrl;
      a.download = res.filename;
      a.click();
      toast.success(`Report ${fmt.toUpperCase()} generated`);
    } else {
      toast.error('Report generation failed');
    }
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="title">Report Builder</div>
        <div className="subtitle">Select behaviors, date range, and hour filters</div>

        <div className="field">
          <div className="label">Behaviors</div>
          <div className="flex gap-8" role="group" aria-label="Behavior multi select">
            {BEHAVIORS.map(b=>(
              <button key={b} className="btn" aria-pressed={behaviors.includes(b)} onClick={()=>toggleBehavior(b)}>
                {behaviors.includes(b) ? '✓ ' : ''}{b}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="label">Date Range</div>
          <DateRange
            ranges={range}
            onChange={(item)=>setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            editableDateInputs
          />
        </div>

        <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
          <label className="field">
            <span className="label">Min Hour (0-24)</span>
            <input className="input" type="number" min={0} max={24} value={hours.min} onChange={e=>setHours({...hours, min:Number(e.target.value)})} />
          </label>
          <label className="field">
            <span className="label">Max Hour (0-24)</span>
            <input className="input" type="number" min={0} max={24} value={hours.max} onChange={e=>setHours({...hours, max:Number(e.target.value)})} />
          </label>
        </div>

        <div className="flex gap-12" style={{marginTop:10}}>
          <button className="btn" onClick={()=>submit('pdf')}>Generate PDF</button>
          <button className="btn btn-secondary" onClick={()=>submit('excel')}>Generate Excel</button>
        </div>
      </div>

      <div className="card">
        <div className="title">Tips</div>
        <ul className="hint" style={{margin:0,paddingLeft:16}}>
          <li>Use the sidebar filters to narrow species.</li>
          <li>Behavior selection is specific to this report definition.</li>
          <li>Hour filters restrict results to the chosen window.</li>
        </ul>
      </div>
    </div>
  );
}
