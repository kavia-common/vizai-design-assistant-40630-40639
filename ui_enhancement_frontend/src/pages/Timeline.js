import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFilters, useURLQuery } from '../context/FilterContext';
import { apiDownload, apiGet } from '../utils/api';
import { toast } from 'react-toastify';

// PUBLIC_INTERFACE
export default function Timeline() {
  /** Timeline view with zoom presets, range selection, and export actions. */
  const { filters, apply, applyFromQuery } = useFilters();
  const query = useURLQuery();
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    // ingest URL filters if present
    applyFromQuery(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.species?.length) params.set('species', filters.species.join(','));
      if (filters.dateRange) {
        params.set('start', filters.dateRange.startDate.toISOString());
        params.set('end', filters.dateRange.endDate.toISOString());
      }
      const res = await apiGet(`/timeline/points?${params.toString()}`);
      if (!ignore) {
        // Graceful fallback to demo points
        const demo = Array.from({length: 24}, (_,h)=>({
          t: new Date(Date.now() - (24-h)*3600*1000).toISOString(),
          v: Math.floor(Math.random()*10)
        }));
        setPoints(res?.points || demo);
        setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [filters]);

  const zoomPreset = (hours) => {
    apply({
      ...filters,
      dateRange: { startDate: new Date(Date.now()-hours*3600*1000), endDate: new Date() }
    });
  };

  const exportFile = async (fmt) => {
    const payload = {
      species: filters.species,
      start: filters.dateRange?.startDate?.toISOString(),
      end: filters.dateRange?.endDate?.toISOString()
    };
    const res = await apiDownload(fmt === 'excel' ? '/timeline/export/excel' : '/timeline/export/pdf', payload, fmt);
    if (res) {
      const a = document.createElement('a');
      a.href = res.blobUrl;
      a.download = res.filename;
      a.click();
      toast.success(`Exported ${fmt.toUpperCase()}`);
    } else {
      toast.error('Export failed');
    }
  };

  const total = useMemo(()=> points.reduce((s,p)=>s+(p.v||0),0), [points]);

  return (
    <div className="card">
      <div className="title">Timeline</div>
      <div className="subtitle">Zoom presets and export current range</div>
      <div className="flex gap-8" role="toolbar" aria-label="Zoom presets">
        <button className="btn" onClick={()=>zoomPreset(24)}>Last 24h</button>
        <button className="btn" onClick={()=>zoomPreset(72)}>Last 3d</button>
        <button className="btn" onClick={()=>zoomPreset(168)}>Last 7d</button>
        <div className="hint">Total points: {total}</div>
        <div style={{flex:1}} />
        <button className="btn" onClick={()=>exportFile('pdf')}>Export PDF</button>
        <button className="btn btn-secondary" onClick={()=>exportFile('excel')}>Export Excel</button>
      </div>

      <div style={{marginTop:12}}>
        <div className="subtitle">Range: {filters.dateRange?.startDate?.toLocaleString()} - {filters.dateRange?.endDate?.toLocaleString()}</div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div className="subtitle">Events per hour (mock)</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(24,1fr)',gap:4}}>
          {points.map((p,i)=>(
            <div key={i} role="img" aria-label={`Hour ${i}, ${p.v} events`} title={`${new Date(p.t).toLocaleTimeString()}: ${p.v}`}
              style={{height:60,background:`linear-gradient(0deg, rgba(37,99,235,0.3) ${p.v*10}%, rgba(229,231,235,1) ${p.v*10}%)`,borderRadius:8,border:'1px solid var(--border)'}} />
          ))}
        </div>
        {loading && <div className="hint" style={{marginTop:8}}>Loading...</div>}
        {!loading && points.length===0 && <div className="hint" style={{marginTop:8}}>No events in selected range.</div>}
      </div>
    </div>
  );
}
