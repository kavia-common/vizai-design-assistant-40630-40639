import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';
import { apiGet } from '../utils/api';

const COLORS = ['#2563EB', '#60A5FA', '#93C5FD', '#F59E0B', '#34D399'];

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Dashboard shows charts; clicking segments navigates to Timeline with contextual filters. */
  const { filters } = useFilters();
  const navigate = useNavigate();

  // Placeholder data; could be fetched via apiGet('/metrics/summary?...')
  // Using memo to simulate filtered values for performance.
  const data = useMemo(() => {
    const base = [
      { name: 'Dolphin', value: 12 },
      { name: 'Whale', value: 8 },
      { name: 'Shark', value: 5 },
      { name: 'Turtle', value: 3 },
      { name: 'Seal', value: 4 }
    ];
    if (!filters.species?.length) return base;
    return base.filter(d => filters.species.includes(d.name));
  }, [filters.species]);

  const onSliceClick = (entry) => {
    const ns = { ...filters, species: [entry.name] };
    const params = new URLSearchParams();
    params.set('species', ns.species.join(','));
    if (ns.dateRange) {
      params.set('start', ns.dateRange.startDate.toISOString());
      params.set('end', ns.dateRange.endDate.toISOString());
    }
    navigate(`/timeline?${params.toString()}`);
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="title">Observations by Species</div>
        <div className="subtitle">Click a segment to drill into Timeline</div>
        <div style={{width:'100%',height:280}}>
          <ResponsiveContainer>
            <PieChart aria-label="Observations by Species">
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                onClick={onSliceClick}
                isAnimationActive
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && <div className="hint">No data for current filters.</div>}
      </div>

      <div className="card">
        <div className="title">Highlights</div>
        <ul className="hint" style={{margin:0,paddingLeft:16}}>
          <li>Filters persist across pages.</li>
          <li>Use the sidebar to adjust species and dates.</li>
          <li>Accessible charts with keyboard focus and tooltips.</li>
        </ul>
      </div>
    </div>
  );
}
