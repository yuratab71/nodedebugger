import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Component, ReactNode } from "react";

interface StatsProps {
    pos: {
        line: number;
        col: number;
    };
}
interface StatsState {}

export class Stats extends Component<StatsProps, StatsState> {
    constructor(props: StatsProps) {
        super(props);
    }

    override render(): ReactNode {
        return (
            <Box width="310px" height="90vh">
                <Typography>line: {this.props.pos.line}</Typography>
                <Typography>col: {this.props.pos.col}</Typography>
            </Box>
        );
    }
}
