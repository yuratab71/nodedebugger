import { Debugger } from "@/main/types/debugger.types";
import {
    AddBreakpointAction,
    ADD_BREAKPOINT,
} from "@/renderer/redux/breakpoints.reducer";
import { GlobalState } from "@/renderer/redux/store";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { RichTreeView, TreeViewBaseItem } from "@mui/x-tree-view";
import { Component, ReactNode } from "react";
import { connect } from "react-redux";

interface StateProps {
    line: number | null;
    col: number | null;
    breakpointsIds: string[];
}

interface DispatchProps {
    addBreakpoint: (id: string) => void;
}

interface StatsState {
    breakpoints: TreeViewBaseItem;
}

class Stats extends Component<StateProps & DispatchProps, StatsState> {
    private BRK_ID = "brk-id";
    private BRK_LABEL = "Breakpoints";

    constructor(props: StateProps & DispatchProps) {
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
        window.electronAPI.onRegisterBreakpoint((brk: Debugger.Breakpoint) => {
            this.props.addBreakpoint(brk.id);
        });
    }

    override render(): ReactNode {
        return (
            <Box width="310px" height="90vh">
                <Box display="flex" flexDirection="row">
                    <Box sx={{ marginRight: 2 }}>
                        <Typography>line: {this.props.line}</Typography>
                    </Box>
                    <Box>
                        <Typography>col: {this.props.col}</Typography>
                    </Box>
                </Box>
                <RichTreeView
                    sx={{ marginTop: 1 }}
                    items={[
                        {
                            id: this.BRK_ID,
                            label: this.BRK_LABEL,
                            children: [
                                ...this.props.breakpointsIds.map((el) => {
                                    const str = el.split("/");
                                    return {
                                        id: el,
                                        label:
                                            str[0] + "/" + str[str.length - 1],
                                    };
                                }),
                            ],
                        },
                    ]}
                />
            </Box>
        );
    }
}

const mapStateToProps = (state: GlobalState): StateProps => {
    return {
        line: state.parsedFiles.line,
        col: state.parsedFiles.col,
        breakpointsIds: state.breakpoints.ids,
    };
};

const mapDispatchToProps: DispatchProps = {
    addBreakpoint: (data) => {
        const action: AddBreakpointAction = {
            type: ADD_BREAKPOINT,
            data,
        };

        return action;
    },
};

export default connect(mapStateToProps, mapDispatchToProps)(Stats);
