
import { useCallback, useEffect, useRef, useState } from "react";
import { layoutApi } from "../services/layoutApi";
import { BUILDING } from "../scene/buildingConfig";

export default function useLayout() {
  const [objects, setObjects] = useState([]);
  const [layoutId, setLayoutId] = useState(null);
  const [status, setStatus] = useState("Loading layout...");
  const [loading, setLoading] = useState(true);

  const loaded = useRef(false);
  const timer = useRef(null);
  const revision = useRef(0);
  const savedRevision = useRef(0);
  const saving = useRef(false);
  const latest = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const layouts = await layoutApi.list();
        if (cancelled) return;

        if (layouts.length > 0) {
          const layout = layouts[0];
          setLayoutId(layout._id);
          setObjects(layout.objects || []);
          latest.current = layout.objects || [];
        }

        setStatus("Layout loaded.");
      } catch (error) {
        setStatus(`Backend unavailable: ${error.message}`);
      } finally {
        if (!cancelled) {
          loaded.current = true;
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      clearTimeout(timer.current);
    };
  }, []);

  const updateObjects = useCallback((updater) => {
    setObjects((current) => {
      const next =
        typeof updater === "function" ? updater(current) : updater;

      latest.current = next;
      revision.current += 1;
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!loaded.current || saving.current) return;

    saving.current = true;
    const currentRevision = revision.current;
    const payload = {
      name: "Main Factory Layout",
      building: {
        length: BUILDING.length,
        width: BUILDING.width,
        corridorWidth: BUILDING.corridorWidth,
      },
      objects: latest.current,
    };

    setStatus("Saving layout...");

    try {
      const result = layoutId
        ? await layoutApi.update(layoutId, payload)
        : await layoutApi.create(payload);

      setLayoutId(result._id);
      savedRevision.current = currentRevision;

      setStatus(
        revision.current === currentRevision
          ? "All changes saved."
          : "New changes pending save."
      );
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
    } finally {
      saving.current = false;
    }
  }, [layoutId]);

  useEffect(() => {
    if (!loaded.current) return;

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save();
    }, 800);

    return () => clearTimeout(timer.current);
  }, [objects, save]);

  return {
    objects,
    updateObjects,
    layoutId,
    status,
    loading,
    save,
  };
}
