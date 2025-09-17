import { DEFAULT_CONNECTION_PATH } from "../constants/debugger";

export const detectConnectionString = (str: string) => {
    const match = str.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/,
    );

    if (match) {
        return `${DEFAULT_CONNECTION_PATH}${match[0]}`;
    }

    return "";
};
