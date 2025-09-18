/* import React, { JSX } from "react";
import styled from "styled-components";
import { Status } from "../../../main/constants/status";
import { Button } from "../common/button";
import { FilePickerUIComponent } from "../common/filePicker";
import "./index.css";

const Info = styled.div`
    font-size: 16;
    width: 20%;
    border-style: solid;
    border-color: red;
    text-align: left;
    padding: 2px;
    margin: 0 auto;
`;

const Logo = styled.div`
    margin: 0;
    font-weight: bold;
    border-style: solid;
    border-color: red;
`;

const InfoBlock = styled.div`
    border-style: solid;
    border-color: red;
`;

const InfoSection = styled.p`
    margin: 0;
    font-size: 12px;
`;

const NavbarMenuBlock = styled.div`
    width: 80%;
    display: flex;
    justify-content: left;
    font-size: 16px;
    font-weight: bold;
    border-style: solid;
    border-color: red;
`;

export type NavbarUIComponentProps = {
    status: Status;
    rss: number | undefined;
    heapTotal: number | undefined;
    heapUsed: number | undefined;
    external: number | undefined;
};

const formatMemory = (mem: number): string => {
    return (mem / 1024 / 1024).toFixed(2);
};

export const NavbarUIComponent: React.FC<NavbarUIComponentProps> = ({
    status,
    rss,
    heapTotal,
    heapUsed,
    external,
}): JSX.Element => {
    const handleStart = () => {
        window.electronAPI.startProcess();
    };

    const handleKill = () => {
        window.electronAPI.terminateProcess();
    };

    const resumeExecution = () => {
        window.electronAPI.resumeExecution();
    };

    return (
        <div className="navbar-wrapper">
            <Info>
                <Logo>Nquisitor</Logo>
                <InfoBlock>
                    <InfoSection>Status: {status}</InfoSection>
                    {status === Status.CONNECTED ? (
                        <>
                            {rss ? (
                                <InfoSection>
                                    RSS: {formatMemory(rss)}
                                </InfoSection>
                            ) : null}
                            {heapTotal ? (
                                <InfoSection>
                                    heapTotal: {formatMemory(heapTotal)}
                                </InfoSection>
                            ) : null}
                            {heapUsed ? (
                                <InfoSection>
                                    heapUsed: {formatMemory(heapUsed)}
                                </InfoSection>
                            ) : null}
                            {external ? (
                                <InfoSection>
                                    external: {formatMemory(external)}
                                </InfoSection>
                            ) : null}
                        </>
                    ) : undefined}
                </InfoBlock>
            </Info>
            <NavbarMenuBlock>
                <FilePickerUIComponent />
                <Button text={"Start Subprocess"} onClick={handleStart} />
                <Button text={"Terminate Subprocess"} onClick={handleKill} />
                <Button text="Resume" onClick={resumeExecution} />
            </NavbarMenuBlock>
        </div>
    );
}; */

import { Component, ReactNode } from "react";
import { AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface NavbarProps {}
interface NavbarState {}

export class Navbar extends Component<NavbarProps, NavbarState> {
    constructor(props: NavbarProps) {
        super(props);
    }

    onClickRun() {
        window.electronAPI.startProcess();
    }

    onClickKill() {
        window.electronAPI.terminateProcess();
    }

    onClickResume() {
        window.electronAPI.resumeExecution();
    }

    onClickOpen() {
        window.electronAPI.setSubprocessDirectory();
    }
    override render(): ReactNode {
        return (
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        aria-label="menu"
                        color="inherit"
                        sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}>
                        Nquisitor
                    </Typography>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={this.onClickOpen}>
                        Open
                    </Button>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={this.onClickRun}>
                        Run
                    </Button>{" "}
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={this.onClickKill}>
                        Kill
                    </Button>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={this.onClickResume}>
                        Resume
                    </Button>
                </Toolbar>
            </AppBar>
        );
    }
}
