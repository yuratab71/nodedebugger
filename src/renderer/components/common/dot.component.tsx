import { Typography } from "@mui/material";
import { Component, ReactNode } from "react";
import { Status } from "../../../main/constants/status";

interface DotProps {
    status: Status;
}

interface DotState {}

export class Dot extends Component<DotProps, DotState> {
    public constructor(props: DotProps) {
        super(props);
    }

    private getColor(status: Status): string {
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

    public override render(): ReactNode {
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
