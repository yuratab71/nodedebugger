import { Typography } from "@mui/material";
import { Box, breakpoints } from "@mui/system";
import { RichTreeView, TreeViewBaseItem } from "@mui/x-tree-view";
import { Component, ReactNode } from "react";

interface StatsProps {
    pos: {
        line: number;
        col: number;
    };
}
interface StatsState {
    breakpoints: TreeViewBaseItem;
}

export class Stats extends Component<StatsProps, StatsState> {
    private BRK_ID = "brk-id";
    private BRK_LABEL = "Breakpoints";

    constructor(props: StatsProps) {
        super(props);
        this.state = {
            breakpoints: {
                id: this.BRK_ID,
                label: this.BRK_LABEL,
                children: [],
            },
        };
    }

    override componentDidMount() {
        window.electronAPI.onRegisterBreakpoint((brk) => {
            this.setState((prevState) => {
                if (prevState.breakpoints.children) {
                    return {
                        breakpoints: {
                            id: this.BRK_ID,
                            label: this.BRK_LABEL,
                            children: [
                                ...prevState.breakpoints.children,
                                { id: brk.id, label: brk.id },
                            ],
                        },
                    };
                } else {
                    return prevState;
                }
            });
        });
    }

    override render(): ReactNode {
        return (
            <Box width="310px" height="90vh">
                <Box display="flex" flexDirection="row">
                    <Box sx={{ marginRight: 2 }}>
                        <Typography>line: {this.props.pos.line}</Typography>
                    </Box>
                    <Box>
                        <Typography>col: {this.props.pos.col}</Typography>
                    </Box>
                </Box>
                <RichTreeView
                    sx={{ marginTop: 1 }}
                    items={[this.state.breakpoints]}
                />
            </Box>
        );
    }
}
