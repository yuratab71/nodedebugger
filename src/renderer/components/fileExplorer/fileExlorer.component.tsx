import { Box } from "@mui/material";
import type { TreeViewBaseItem } from "@mui/x-tree-view";
import { RichTreeView } from "@mui/x-tree-view";
import type { ReactNode, SyntheticEvent } from "react";
import { Component } from "react";
import { connect } from "react-redux";
import type { Entry } from "../../../main/types/fileManager.types";
import type {
    AddParsedFileAction,
    UpdateCurrentFileAction,
} from "../../redux/parsedFiles.reducer";
import {
    ADD_PARSED_FILE,
    UPDATE_CURRENT_FILE,
} from "../../redux/parsedFiles.reducer";
import type { GlobalState } from "../../redux/store";

type TreeViewBaseItemExtended = TreeViewBaseItem & { inspectorUrl: string };

interface StateProps {
    entries: Entry[];
    currentFileUrl: string | null;
}

interface DispatchProps {
    addParsedFiles: (files: Entry[]) => void;
    updateFile: (url: string, content: string) => void;
}

type FileExplorerProps = StateProps & DispatchProps;

class FileExplorer extends Component<FileExplorerProps> {
    private readonly treeItems: TreeViewBaseItem[] = [];

    public override componentDidMount() {
        window.electronAPI.onParsedFilesUpdate((entries: Entry[]) => {
            this.props.addParsedFiles([...entries]);
        });
    }

    private readonly onItemFocus = async (
        _: SyntheticEvent<Element, Event> | null,
        itemId: string,
    ) => {
        if (itemId === this.props.currentFileUrl) return;

        this.props.updateFile(
            itemId,
            await window.electronAPI.getFileContent(itemId),
        );
    };

    private readonly onItemClick = async (
        _: React.MouseEvent<Element, MouseEvent>,
        itemId: string,
    ) => {
        if (itemId === this.props.currentFileUrl) return;

        this.props.updateFile(
            itemId,
            await window.electronAPI.getFileContent(itemId),
        );
    };

    public override render(): ReactNode {
        return (
            <Box width="182px" height="90vh">
                <RichTreeView
                    sx={{ marginTop: 0 }}
                    onItemClick={this.onItemClick}
                    items={this.props.entries.map(
                        (entry: Entry): TreeViewBaseItemExtended => {
                            return {
                                id: entry.path,
                                label: "@:" + entry.name + entry.extension,
                                inspectorUrl: entry.inspectorUrl,
                                children: [
                                    ...entry.sources.map<TreeViewBaseItem>(
                                        (el: string) => {
                                            return {
                                                id: el ?? "undefined",
                                                label: el ?? "undefined",
                                                url: entry.path,
                                                inspectorUrl: entry.path,
                                            };
                                        },
                                    ),
                                ],
                            };
                        },
                    )}
                />
            </Box>
        );
    }
}

const mapStateToProps = (state: GlobalState): StateProps => {
    return {
        entries: state.parsedFiles.entries,
        currentFileUrl: state.parsedFiles.currentFileUrl,
    };
};

const mapDispatchToProps: DispatchProps = {
    addParsedFiles: (files: Entry[]) => {
        const action: AddParsedFileAction = {
            type: ADD_PARSED_FILE,
            data: files,
        };

        return action;
    },
    updateFile: (url: string, content: string) => {
        const action: UpdateCurrentFileAction = {
            type: UPDATE_CURRENT_FILE,
            data: {
                url,
                content,
            },
        };

        return action;
    },
};

export default connect(mapStateToProps, mapDispatchToProps)(FileExplorer);
