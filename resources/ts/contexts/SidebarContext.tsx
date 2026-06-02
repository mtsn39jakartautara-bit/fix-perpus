// contexts/SidebarContext.tsx
import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";

interface SidebarContextType {
    openMenus: Record<string, boolean>;
    toggleMenu: (menuLabel: string) => void;
    setOpenMenu: (menuLabel: string, isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
        // Load dari localStorage saat initial render (opsional)
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebar-open-menus");
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    return {};
                }
            }
        }
        return {};
    });

    const toggleMenu = (menuLabel: string) => {
        setOpenMenus((prev) => {
            const newState = {
                ...prev,
                [menuLabel]: !prev[menuLabel],
            };
            // Simpan ke localStorage (opsional)
            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "sidebar-open-menus",
                    JSON.stringify(newState)
                );
            }
            return newState;
        });
    };

    const setOpenMenu = (menuLabel: string, isOpen: boolean) => {
        setOpenMenus((prev) => {
            const newState = {
                ...prev,
                [menuLabel]: isOpen,
            };
            // Simpan ke localStorage (opsional)
            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "sidebar-open-menus",
                    JSON.stringify(newState)
                );
            }
            return newState;
        });
    };

    return (
        <SidebarContext.Provider value={{ openMenus, toggleMenu, setOpenMenu }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
}
