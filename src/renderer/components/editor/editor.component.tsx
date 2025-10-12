import { Box, Menu, MenuItem } from "@mui/material";
import React, { Component, createRef, ReactNode, RefObject } from "react";
import { connect } from "react-redux";
import {
    UPDATE_LINE_AND_COL_POSITION,
    UpdateLineAndColPositionAction,
} from "@/renderer/redux/parsedFiles.reducer";
import { GlobalState } from "@/renderer/redux/store";

interface StateProps {
    currentFileContent: string | null;
    currentFileUrl: string | null;
}

interface DispatchProps {
    onPosChange: (line: number, col: number) => void;
}
interface EditorState {
    menuPos: { mouseX: number; mouseY: number } | null;
    line: number | null;
    col: number | null;
}

class Editor extends Component<StateProps & DispatchProps, EditorState> {
    public constructor(props: StateProps & DispatchProps) {
        super(props);
    }

    public override state: EditorState = {
        menuPos: null,
        line: null,
        col: null,
    };

    private readonly preRef: RefObject<HTMLPreElement | null> =
        createRef<HTMLPreElement>();

    private getCaretIndex(pre: HTMLElement, range: Range): number {
        const preRange = document.createRange();
        preRange.selectNodeContents(pre);
        preRange.setEnd(range.startContainer, range.startOffset);
        return preRange.toString().length;
    }

    private readonly handleMouse = (e: React.MouseEvent): void => {
        if (!this.preRef.current) return;

        let range: Range | null = null;

        if ("caretRangeFromPoint" in document) {
            range = document.caretRangeFromPoint(e.clientX, e.clientY);
        } else if ("caretPositionFromPoint" in document) {
            // biome-ignore lint: types are not up to date, this property is missing
            const pos = (document as any).caretPositionFromPoint(
                e.clientX,
                e.clientY,
            );
            if (pos) {
                range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
            }
        }

        if (!range) return;

        const pre = this.preRef.current;
        const caretIndex = this.getCaretIndex(pre, range);
        const before = pre.innerText.slice(0, caretIndex);
        const line = before.split("\n").length;
        const col = caretIndex - before.lastIndexOf("\n");

        this.setState((prevState) => ({ ...prevState, line: line, col: col }));
        if (this.props.currentFileContent != null)
            this.props.onPosChange(line, col);
    };

    private readonly handleContextMenu = (
        e: React.MouseEvent<HTMLPreElement>,
    ): void => {
        e.preventDefault();
        this.setState({
            menuPos: {
                mouseX: e.clientX + 2,
                mouseY: e.clientY - 6,
            },
        });
    };

    private readonly handleCloseMenu = (): void => {
        this.setState({ menuPos: null });
    };

    public override render(): ReactNode {
        return (
            <>
                <Box
                    flex={1}
                    padding={0}
                    margin={0}
                    maxWidth={1024}
                    overflow="scroll"
                    fontFamily="monospace"
                    sx={{
                        maxWidth: 960,
                        height: "90vh",
                        whiteSpace: "pre",
                        p: 1,
                        backgroundColor: "background.paper",
                        border: "1px solid",
                        borderColor: "delimiter",
                        overflowX: "scroll",
                    }}
                >
                    <pre
                        onContextMenu={this.handleContextMenu}
                        ref={this.preRef}
                        onMouseMove={this.handleMouse}
                    >
                        {this.props.currentFileContent
                            ? this.props.currentFileContent
                            : "..."}
                    </pre>
                </Box>
                <Menu
                    open={this.state.menuPos !== null}
                    onClose={this.handleCloseMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        this.state.menuPos !== null
                            ? {
                                  top: this.state.menuPos?.mouseY,
                                  left: this.state.menuPos?.mouseX,
                              }
                            : { top: 0, left: 0 }
                    }
                >
                    <MenuItem
                        onClick={(): void => {
                            window.electronAPI.setBreakpointByUrl({
                                url: this.props.currentFileUrl,
                                lineNumber: this.state.line,
                            });
                        }}
                    >
                        Set Breakpoint
                    </MenuItem>
                    <MenuItem
                        onClick={async (): Promise<void> => {
                            await window.electronAPI.getObjectId("bootstrap");
                        }}
                    >
                        Get Object Id
                    </MenuItem>
                </Menu>
            </>
        );
    }
}

const mapStateToProps = (state: GlobalState): StateProps => {
    return {
        currentFileContent: state.parsedFiles.currentFileContent,
        currentFileUrl: state.parsedFiles.currentFileUrl,
    };
};

const mapDispatchToProps: DispatchProps = {
    onPosChange: (line: number, col: number) => {
        const action: UpdateLineAndColPositionAction = {
            type: UPDATE_LINE_AND_COL_POSITION,
            data: {
                line,
                col,
            },
        };

        return action;
    },
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
