import { useState, useEffect } from "react";

export function useMenusPreview() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch("/api/menus");
        const data = await response.json();

        if (data.success && data.data) {
          setMenus(data.data);
        } else {
          setError(data.message || "Failed to fetch menus");
          setMenus([]);
        }
      } catch (err) {
        console.error("Failed to fetch menus:", err);
        setError(err.message);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return { menus, loading, error };
}