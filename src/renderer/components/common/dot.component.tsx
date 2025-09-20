import { Status } from "@main/constants/status";
import { Box, Typography } from "@mui/material";
import { Component, ReactNode } from "react";

interface DotProps {
    status: Status;
}

interface DotState {}

export class Dot extends Component<DotProps, DotState> {
    constructor(props: DotProps) {
        super(props);
    }

    getColor(status: Status) {
        switch (status) {
            case Status.NOT_ACTIVE:
                return "grey";
            case Status.CONNECTED:
                return "green";
            case Status.ERROR:
                return "red";
            case Status.DISCONNECTED:
                return "orange";
            default:
                return "grey";
        }
    }

    override render(): ReactNode {
        return (
            <Typography
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: this.getColor(this.props.status),
                    border: "1px solid #ccc",
                }}
            />
        );
    }
}
