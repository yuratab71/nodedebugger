import React from "react";
import styled from "styled-components";
import { Entry } from "../../../modules/fileManager";

type FileExplorerUIComponentProps = {
    files: Entry[];
    onClickCallback: (src: string) => void;
};

const FileExplorerWrapper = styled.div`
    border-style: solid;
    border-color: orange;
    font-size: 14px;
    width: 20%;
    max-height: 350px;
`;

const FileIcon = styled.div`
    bacground-color: white;
    border-color: blue;
    border-style: none double none;
    text-color: black;
    &:hover {
        background-color: blue;
    }
`;

export const FileExplorerUIComponent: React.FC<
    FileExplorerUIComponentProps
> = ({ files, onClickCallback }: FileExplorerUIComponentProps) => {
    return (
        <FileExplorerWrapper>
            {files.map((el: Entry) => {
                return (
                    <FileIcon onClick={() => onClickCallback(el.path)}>
                        {el.isDir ? "/" : ""}
                        {el.name}
                    </FileIcon>
                );
            })}
        </FileExplorerWrapper>
    );
};
