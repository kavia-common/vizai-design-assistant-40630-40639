import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';

// PUBLIC_INTERFACE
export default function ChatbotWidget() {
  /** Bottom-right AI chatbot widget with context-aware suggestions and quick actions. */
  const [open, setOpen] = useState(false);
  const { filters, apply } = useFilters();
  const location = useLocation();
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    const base = [];
    const page = location.pathname.replace('/','');
    if (page === 'dashboard') {
      base.push({
        text: 'Show only Dolphin observations in last 7 days',
        action: () => apply({ 
          ...filters, 
          species: ['Dolphin'], 
          dateRange: { startDate: new Date(Date.now()-7*24*3600*1000), endDate: new Date() } 
        })
      });
      base.push({
        text: 'Go to Timeline with current filters',
        action: () => navigate('/timeline' + buildQuery(filters))
      });
    } else if (page === 'timeline') {
      base.push({
        text: 'Zoom to last 24 hours',
        action: () => apply({
          ...filters,
          dateRange: { startDate: new Date(Date.now()-24*3600*1000), endDate: new Date() }
        })
      });
      base.push({
        text: 'Export current view as PDF',
        action: () => navigate('/timeline?export=pdf' + buildQuery(filters))
      });
    } else if (page === 'reports') {
      base.push({
        text: 'Generate Excel report for Sharks this month',
        action: () => navigate('/reports?species=Shark&fmt=excel')
      });
    }
    base.push({
      text: 'Reset filters',
      action: () => apply({
        species: [],
        behaviors: [],
        dateRange: { startDate: new Date(Date.now()-7*24*3600*1000), endDate: new Date() },
        hours: { min: 0, max: 24 }
      })
    });
    return base;
  }, [filters, location.pathname, apply, navigate]);

  return (
    <div className="chatbot" aria-live="polite">
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="AI assistant">
          <div className="chatbot-header">
            <div>VizAI Assistant</div>
            <button className="btn" onClick={() => setOpen(false)} aria-label="Close assistant">Close</button>
          </div>
          <div className="chatbot-body">
            <div className="hint">Suggestions</div>
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion" onClick={s.action}>
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        className="chatbot-toggle"
        aria-label={open ? 'Hide assistant' : 'Show assistant'}
        onClick={() => setOpen(v => !v)}
        title="AI Assistant"
      >
        💬
      </button>
    </div>
  );
}

function buildQuery(filters){
  const p = new URLSearchParams();
  if (filters.species?.length) p.set('species', filters.species.join(','));
  if (filters.behaviors?.length) p.set('behaviors', filters.behaviors.join(','));
  if (filters.dateRange) { p.set('start', filters.dateRange.startDate.toISOString()); p.set('end', filters.dateRange.endDate.toISOString()); }
  const qs = p.toString();
  return qs ? ('?' + qs) : '';
}
