import { Entry } from "../../../main/types/fileManager.types";
import { RichTreeView, TreeViewBaseItem } from "@mui/x-tree-view";
import { Box } from "@mui/material";
import { Component, ReactNode, SyntheticEvent } from "react";

interface FileExplorerProps {
    onClick: (url: string) => Promise<void>;
}
interface FileExplorerState {
    treeItems: TreeViewBaseItem[];
}

export class FileExplorer extends Component<
    FileExplorerProps,
    FileExplorerState
> {
    constructor(props: FileExplorerProps) {
        super(props);
        this.state = {
            treeItems: [],
        };
    }

    override componentDidMount() {
        window.electronAPI.onParsedFilesUpdate((entry: Entry) => {
            const sources = entry.sources;
            if (!sources?.length) return;

            const treeItem: TreeViewBaseItem = {
                id: entry.path,
                label: "@/" + entry.name + entry.extension,
                children: [
                    ...sources.map((el: string) => {
                        return {
                            id: el,
                            label: el,
                        };
                    }),
                ],
            };
            this.setState((prevState) => ({
                treeItems: [...prevState.treeItems, treeItem],
            }));
        });
    }

    onItemFocus = async (
        _: SyntheticEvent<Element, Event> | null,
        itemId: string,
    ) => {
        console.log(this.props);
        await this.props.onClick(itemId);
    };

    treeItems: TreeViewBaseItem[] = [];

    onItemClick = (
        _: React.MouseEvent<Element, MouseEvent>,
        itemId: string,
    ) => {
        this.props.onClick(itemId);
    };

    override render(): ReactNode {
        return (
            <Box width="182px" height="90vh">
                <RichTreeView
                    sx={{ marginTop: 0 }}
                    onItemClick={this.onItemClick}
                    items={this.state.treeItems}
                />
            </Box>
        );
    }
}
