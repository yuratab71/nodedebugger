import { Entry } from "../../main/types/fileManager.types";

export type ParsedFilesState = {
    entries: Entry[];
    currentFileUrl: string | null;
    currentFileContent: string | null;
    line: number | null;
    col: number | null;
};

const initialState: ParsedFilesState = {
    entries: [],
    currentFileUrl: null,
    currentFileContent: null,
    line: null,
    col: null,
};

export const ADD_PARSED_FILE = "ADD_PARSED_FILE";
export const DELETE_PARSED_FILE = "DELETE_PARSED_FILE";
export const UPDATE_CURRENT_FILE = "UPDATE_CURRENT_FILE";
export const UPDATE_LINE_AND_COL_POSITION = "UPDATE_LINE_AND_COL_POSITION";

export interface AddParsedFileAction {
    type: typeof ADD_PARSED_FILE;
    data: Entry[];
}

export interface DeleteParsedFilesAction {
    type: typeof DELETE_PARSED_FILE;
}

export interface UpdateCurrentFileAction {
    type: typeof UPDATE_CURRENT_FILE;
    data: {
        url: string;
        content: string;
    };
}

export interface UpdateLineAndColPositionAction {
    type: typeof UPDATE_LINE_AND_COL_POSITION;
    data: {
        line: number;
        col: number;
    };
}

export function parsedFileReducer(
    state: ParsedFilesState = initialState,
    action:
        | AddParsedFileAction
        | DeleteParsedFilesAction
        | UpdateCurrentFileAction
        | UpdateLineAndColPositionAction,
): ParsedFilesState {
    switch (action.type) {
        case ADD_PARSED_FILE:
            return {
                ...state,
                entries: [...state.entries, ...action.data],
            };
        case DELETE_PARSED_FILE:
            return { ...state, entries: [] };
        case UPDATE_CURRENT_FILE:
            return {
                ...state,
                currentFileUrl: action.data.url,
                currentFileContent: action.data.content,
            };
        case UPDATE_LINE_AND_COL_POSITION:
            return {
                ...state,
                line: action.data.line,
                col: action.data.col,
            };
        default:
            return state;
    }
}
