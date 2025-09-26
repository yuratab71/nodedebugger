// methods that start some process and dont get any response start with RUN
// methods that send some data on updates starts with ON
// method to get data from backend starts with GET
// methods to send data to backend starts with SET

export const RUN_START_SUBPROCESS = "run_start_subprocess";
export const RUN_TERMINATE_SUBPROCESS = "run_terminate_subprocess";
export const ON_PROCESS_LOG_UPDATE = "on_process_log_update";
export const ON_WS_CONNECTION_STATUS_UPDATE = "on_ws_connection_status_update";

export const ON_MEMORY_USAGE_UPDATE = "on_memory_usage_update";
export const SET_DIRECTORY = "set_directory";
export const GET_FILE_STRUCTURE = "get_file_structure";
export const GET_FILE_CONTENT = "get_file_content";
export const GET_ROOT_DIR = "get_root_dir";
export const ON_ROOT_DIR_RESOLVE = "on_root_dir_resolve";
export const ON_FILE_STRUCTURE_RESOLVE = "on_file_structure_resolve";
export const GET_SOURCE_MAP = "get_source_map";
export const ON_PARSED_FILES_UPDATE = "on_parsed_files_update";
//debugger command
export const GET_SCRIPT_SOURCE = "get_script_source";
export const RUN_RESUME_EXECUTION = "run_resume_execution";
export const SET_BREAKPOINT_BY_SCRIPT_ID = "set_breakpoint_by_script_id";
export const SET_BREAKPOINT_BY_URL = "set_breakpoint_by_url";
export const ON_REGISTER_BREAKPOINT = "on_register_breakpoint";

export const GET_OBJECT_ID = "get_object_id";
