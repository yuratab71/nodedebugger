import React from "react";
import styled from "styled-components";
import { Entry } from "../../../modules/fileManager";

type FileExplorerUIComponentProps = {
    files: Entry[];
    dir: string;
    canStepOutOfDir: boolean;
    onClickCallback: (entry: Entry) => void;
    onStepOutOfDirCallback: () => void;
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
> = ({
    files,
    dir,
    canStepOutOfDir,
    onStepOutOfDirCallback,
    onClickCallback,
}: FileExplorerUIComponentProps) => {
    console.log("DIR: " + dir);
    console.log(Array.isArray(files));
    console.log(files);

    return (
        <FileExplorerWrapper>
            <FileIcon>{"~/" + dir.split("\\").slice(-1)[0]}</FileIcon>
            <FileIcon onClick={onStepOutOfDirCallback}>
                {canStepOutOfDir && "../"}
            </FileIcon>
            {Array.isArray(files) &&
                files?.map((el: Entry) => {
                    return (
                        <FileIcon onClick={() => onClickCallback(el)}>
                            {el.isDir ? "/" : ""}
                            {el.name}
                        </FileIcon>
                    );
                })}
        </FileExplorerWrapper>
    );
};
