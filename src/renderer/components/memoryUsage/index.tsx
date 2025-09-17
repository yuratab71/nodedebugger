import React from "react";
import { JSX } from "react/jsx-runtime";
import styled from "styled-components";

export type MemoryUsageUIComponentProps = {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    isConnected: boolean;
};

const MemoryUsageWrapper = styled.div`
    background-color: grey;
`;

export const MemoryUsageUIComponent: React.FC<MemoryUsageUIComponentProps> = ({
    rss,
    heapTotal,
    heapUsed,
    external,
    isConnected,
}): JSX.Element => {
    return (
        <>
            <MemoryUsageWrapper>
                <span>
                    rss: {isConnected ? (rss / 1024 / 1024).toFixed(2) : 0}{" "}
                </span>
                <span>
                    heapTotal:{" "}
                    {isConnected
                        ? (heapTotal / 1024 / 1024).toFixed(2)
                        : 0}{" "}
                </span>
                <span>
                    heapUsed:{" "}
                    {isConnected ? (heapUsed / 1024 / 1024).toFixed(2) : 0}{" "}
                </span>
                <span>
                    external:{" "}
                    {isConnected ? (external / 1024 / 1024).toFixed(2) : 0}{" "}
                </span>
            </MemoryUsageWrapper>
        </>
    );
};
