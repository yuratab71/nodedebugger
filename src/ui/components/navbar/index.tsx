import React, { JSX } from "react";
import { Status } from "../../../constants/status";

export type NavbarUIComponentProps = {
    status: Status;
};

const navbarContainer: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-evenly",
};

const navbarElement: React.CSSProperties = {
    width: "20px",
};

export const NavbarUIComponent: React.FC<NavbarUIComponentProps> = ({
    status,
}): JSX.Element => {
    return (
        <div style={navbarContainer}>
            <div style={navbarElement} className="navbarLogo">
                <h1>Nquisitor</h1>
            </div>
            <div style={navbarElement}>{status}</div>
        </div>
    );
};
