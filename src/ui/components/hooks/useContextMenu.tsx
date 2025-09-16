import { useState, useEffect } from "react";

export type ContextMenuState = {
    x: number;
    y: number;
    visible: boolean;
};

export function useContextMenu() {
    const [menu, setMenu] = useState<ContextMenuState>({
        x: 0,
        y: 0,
        visible: false,
    });

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenu({
            x: e.pageX,
            y: e.pageY,
            visible: true,
        });
    };

    const hideMenu = () => setMenu((prev) => ({ ...prev, visible: false }));

    useEffect(() => {
        window.addEventListener("click", hideMenu);
        return () => window.removeEventListener("click", hideMenu);
    }, []);

    return { menu, handleContextMenu, hideMenu };
}
