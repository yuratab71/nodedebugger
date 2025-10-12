import { Box, Typography } from "@mui/material";
import { Component, ReactNode } from "react";
import { Status } from "../../../main/constants/status";
import { Runtime } from "../../../main/types/runtime.types";

interface FooterProps {}
interface FoterState {
    memoryStats: Runtime.MemoryStats;
    wsStatus: Status;
}

export default class Footer extends Component<FooterProps, FoterState> {
    public constructor(props: FooterProps) {
        super(props);
    }

    public override render(): ReactNode {
        return (
            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    width: "100%",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    p: 1,
                    backgroundColor: "grey",
                    display: "flex",
                    justifyContent: "space-between",
                    zIndex: 10000,
                }}
            >
                <Typography fontSize="12px">
                    Nquisitor the NodeJS debugger
                </Typography>

                <Typography fontSize="12px">Powered by Electron</Typography>
                <Typography fontWeight="bold" fontSize="12px">
                    v 0.0.1
                </Typography>
            </Box>
        );
    }
}
