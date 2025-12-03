import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Filter model:
 * {
 *   species: string[]; behaviors?: string[];
 *   dateRange: { startDate: Date, endDate: Date };
 *   hours: { min?: number, max?: number }
 * }
 */

// PUBLIC_INTERFACE
export const FilterContext = createContext(null);

// INTERNAL: localStorage key
const STORE_KEY = 'vizai_filters_v1';

function parseJSONSafe(v, fallback) {
  try { return JSON.parse(v); } catch { return fallback; }
}

// PUBLIC_INTERFACE
export function useFilters() {
  /** Access centralized filters with helpers. */
  return useContext(FilterContext);
}

// PUBLIC_INTERFACE
export function useURLQuery() {
  /** Read current URL query as object. */
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
}

export function FilterProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(() => {
    const saved = parseJSONSafe(localStorage.getItem(STORE_KEY), null);
    if (saved?.dateRange?.startDate) {
      saved.dateRange.startDate = new Date(saved.dateRange.startDate);
    }
    if (saved?.dateRange?.endDate) {
      saved.dateRange.endDate = new Date(saved.dateRange.endDate);
    }
    return saved || {
      species: [],
      behaviors: [],
      dateRange: { startDate: new Date(Date.now() - 7*24*3600*1000), endDate: new Date() },
      hours: { min: 0, max: 24 }
    };
  });

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(filters));
  }, [filters]);

  const applyFromQuery = (queryObj) => {
    const ns = { ...filters };
    if (queryObj.species) ns.species = String(queryObj.species).split(',').filter(Boolean);
    if (queryObj.behaviors) ns.behaviors = String(queryObj.behaviors).split(',').filter(Boolean);
    if (queryObj.start && queryObj.end) {
      const s = new Date(queryObj.start);
      const e = new Date(queryObj.end);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        ns.dateRange = { startDate: s, endDate: e };
      }
    }
    setFilters(ns);
  };

  const updateQuery = (next) => {
    const params = new URLSearchParams(location.search);
    if (next.species) params.set('species', next.species.join(','));
    if (next.behaviors) params.set('behaviors', next.behaviors.join(','));
    if (next.dateRange) {
      params.set('start', next.dateRange.startDate.toISOString());
      params.set('end', next.dateRange.endDate.toISOString());
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const value = {
    filters,
    setFilters,
    apply: (next) => { setFilters(next); updateQuery(next); },
    reset: () => {
      const def = {
        species: [],
        behaviors: [],
        dateRange: { startDate: new Date(Date.now() - 7*24*3600*1000), endDate: new Date() },
        hours: { min: 0, max: 24 }
      };
      setFilters(def);
      updateQuery(def);
    },
    applyFromQuery
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
