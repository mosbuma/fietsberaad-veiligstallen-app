import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReportsFiltersState {
  nameFilter: string;
  showGemeentenWithoutStallingen: "yes" | "no" | "only";
  showGemeentenWithoutUsers: "yes" | "no" | "only";
  showGemeentenWithoutExploitanten: "yes" | "no" | "only";
  setNameFilter: (filter: string) => void;
  setShowGemeentenWithoutStallingen: (value: "yes" | "no" | "only") => void;
  setShowGemeentenWithoutUsers: (value: "yes" | "no" | "only") => void;
  setShowGemeentenWithoutExploitanten: (value: "yes" | "no" | "only") => void;
  resetFilters: () => void;
}

export const useReportsFilters = create<ReportsFiltersState>()(
  persist(
    (set) => ({
      nameFilter: "",
      showGemeentenWithoutStallingen: "no",
      showGemeentenWithoutUsers: "no",
      showGemeentenWithoutExploitanten: "yes",
      setNameFilter: (filter) => set({ nameFilter: filter }),
      setShowGemeentenWithoutStallingen: (value) => set({ showGemeentenWithoutStallingen: value }),
      setShowGemeentenWithoutUsers: (value) => set({ showGemeentenWithoutUsers: value }),
      setShowGemeentenWithoutExploitanten: (value) => set({ showGemeentenWithoutExploitanten: value }),
      resetFilters: () => set({
        nameFilter: "",
        showGemeentenWithoutStallingen: "no",
        showGemeentenWithoutUsers: "no",
        showGemeentenWithoutExploitanten: "yes",
      }),
    }),
    {
      name: "reports-filters",
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
); 