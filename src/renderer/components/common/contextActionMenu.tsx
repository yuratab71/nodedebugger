import React from "react";
import styled from "styled-components";
import { ContextMenuState } from "../hooks/useContextMenu";

export type MenuItem = {
    label: string;
    onClick: () => void;
};

const MenuContainer = styled.ul<{ x: number; y: number; visible: boolean }>`
    position: fixed;
    top: ${({ y }) => y}px;
    left: ${({ x }) => x}px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    list-style: none;
    padding: 8px 0;
    margin: 0;
    display: ${({ visible }) => (visible ? "block" : "none")};
    z-index: 1000;
    min-width: 160px;
`;

const MenuItemStyled = styled.li`
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;

    &:hover {
        background: #f3f4f6;
    }
`;

type Props = {
    state: ContextMenuState;
    items: MenuItem[];
    onClose: () => void;
};

export const ContextMenu: React.FC<Props> = ({ state, items, onClose }) => {
    return (
        <MenuContainer x={state.x} y={state.y} visible={state.visible}>
            {items.map((item, index) => (
                <MenuItemStyled
                    key={index}
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}>
                    {item.label}
                </MenuItemStyled>
            ))}
        </MenuContainer>
    );
};
