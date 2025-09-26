import React, { Component, createRef, ReactNode, RefObject } from "react";
import { Box, Menu, MenuItem } from "@mui/material";

interface EditorProps {
    value: string;
    onSetBreakpointByUrl: () => void;
    onPosChange: (line: number, col: number) => void;
}
interface EditorState {
    menuPos: { mouseX: number; mouseY: number } | null;
}

export class Editor extends Component<EditorProps, EditorState> {
    constructor(props: EditorProps) {
        super(props);
        this.state = {
            menuPos: null,
        };
    }

    preRef: RefObject<HTMLPreElement | null> = createRef<HTMLPreElement>();

    getCaretIndex(pre: HTMLElement, range: Range): number {
        const preRange = document.createRange();
        preRange.selectNodeContents(pre);
        preRange.setEnd(range.startContainer, range.startOffset);
        return preRange.toString().length;
    }

    handleMouse = (e: React.MouseEvent) => {
        if (!this.preRef.current) return;

        let range: Range | null = null;

        if ("caretRangeFromPoint" in document) {
            range = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
        } else if ("caretPositionFromPoint" in document) {
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

        this.props.onPosChange(line, col);
    };

    handleContextMenu = (e: React.MouseEvent<HTMLPreElement>) => {
        e.preventDefault();
        this.setState({
            menuPos: {
                mouseX: e.clientX + 2,
                mouseY: e.clientY - 6,
            },
        });
    };

    handleCloseMenu = () => {
        this.setState({ menuPos: null });
    };

    override render(): ReactNode {
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
                    }}>
                    <pre
                        onContextMenu={this.handleContextMenu}
                        ref={this.preRef}
                        onMouseMove={this.handleMouse}>
                        {this.props.value}
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
                    }>
                    <MenuItem
                        onClick={() => {
                            this.props.onSetBreakpointByUrl();
                        }}>
                        Set Breakpoint
                    </MenuItem>
                    <MenuItem
                        onClick={async () => {
                            const name =
                                await window.electronAPI.getObjectId(
                                    "bootstrap",
                                );
                            console.log(name);
                        }}>
                        Get Object Id
                    </MenuItem>
                </Menu>
            </>
        );
    }
}
