import React, { JSX } from "react";
import styled from "styled-components";
import { Status } from "../../../constants/status";

const NavbarWrapper = styled.div`
    display: flex;
    height: 80px;
    flex-direction: row;
`;

const MainLogo = styled.div`
    font-size: 16;
    width: 20%;
    font-weight: bold;
    border-style: solid;
    border-color: red;
text-align: center;
margin: 0 auto;
`;

const NavbarMenuBlock = styled.div`
    width: 80%;
    display: flex;
    justify-content: space-around;
    font-size: 16px;
    font-weight: bold;
    border-style: solid;
    border-color: red;
`;

export type NavbarUIComponentProps = {
    status: Status;
};

const navbarElement: React.CSSProperties = {
    width: "20px",
};

export const NavbarUIComponent: React.FC<NavbarUIComponentProps> = ({
    status,
}): JSX.Element => {
    return (
        <NavbarWrapper>
            <MainLogo>
                Nquisitor
            </MainLogo>
            <NavbarMenuBlock>
                <div style={navbarElement}>{status}</div>
            </NavbarMenuBlock>
        </NavbarWrapper>
    );
};
