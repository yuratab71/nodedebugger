import { Entry } from "@/main/types/fileManager.types";

export type ParsedFilesState = Entry[];

const initialState: ParsedFilesState = [];

export const ADD_PARSED_FILE = "ADD_PARSED_FILE";
export const DELETE_PARSED_FILE = "DELETE_PARSED_FILE";

export interface AddParsedFileAction {
    type: typeof ADD_PARSED_FILE;
    parsedFiles: ParsedFilesState;
}

export interface DeleteParsedFilesAction {
    type: typeof DELETE_PARSED_FILE;
}

export function parsedFileReducer(
    state: ParsedFilesState = initialState,
    action: AddParsedFileAction | DeleteParsedFilesAction,
): ParsedFilesState {
    switch (action.type) {
        case ADD_PARSED_FILE:
            return [...state, ...action?.parsedFiles];
        case DELETE_PARSED_FILE:
            return [];
        default:
            return state;
    }
}
