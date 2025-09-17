import React, { JSX } from "react";
import styled from "styled-components";
import { Status } from "../../../main/constants/status";
import { Button } from "../common/button";
import { FilePickerUIComponent } from "../common/filePicker";
const NavbarWrapper = styled.div`
    display: flex;
    min-height: 80px;
    flex-direction: row;
`;

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
        <NavbarWrapper>
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
        </NavbarWrapper>
    );
};
