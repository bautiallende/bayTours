import { useState, useEffect, useRef } from "react";

export default function useGroupCalendar(groupId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Caché en memoria: { [groupId]: { data, timestamp } }
  const cacheRef = useRef({});

  useEffect(() => {
    if (!groupId) return; // sin grupo ⇒ no pedimos nada

    const now = Date.now();
    const cached = cacheRef.current[groupId];

    // Si tenemos datos frescos (<5 min) usamos caché
    if (cached && now - cached.timestamp < 5 * 60 * 1000) {
      setEvents(cached.data);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/calendar/group/${groupId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Error de red");
        return res.json();
      })
      .then((data) => {
        cacheRef.current[groupId] = { data, timestamp: now };
        setEvents(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [groupId]);

  return { events, loading, error };
}
