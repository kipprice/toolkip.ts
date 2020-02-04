
/**
 * Request a file system in which to store application data.
 * @param   type                local file system type
 * @param   size                indicates how much storage space, in bytes, the application expects to need
 * @param   successCallback     invoked with a FileSystem object
 * @param   errorCallback       invoked if error occurs retrieving file system
 */
declare var requestFileSystem: (type: any, size: number, success: Function, err: Function) => void;

/**
 * Request a file system in which to store application data.
 * @param   type                local file system type
 * @param   size                indicates how much storage space, in bytes, the application expects to need
 * @param   successCallback     invoked with a FileSystem object
 * @param   errorCallback       invoked if error occurs retrieving file system
 */
declare var webkitRequestFileSystem: (type: any, size: number, success: Function, err: Function) => void;

declare var PERSISTENT: any;
declare var TEMPORARY: any;

declare type FileSystem = {
    root: DirectoryEntry;
}

declare type FileEntry = {
    createWriter: (success: Function, err: Function) => void;
    file: (success: Function, err: Function) => void;
    remove: (success: Function, err: Function) => void;
    toURL: () => string;
}

declare type FileWriter = {
    seek: (position: number) => void;
    write: (data: Blob) => void;
    truncate: (length: number) => void;
    onwriteend: Function;
    length: number;
    onerror: Function;
}

declare type DirectoryEntry = {
    constructor(name, fullPzth, FileSystem, nativeURL);
    createReader: () => DirectoryReader;
    getDirectory: (path: string, dirOptions: any, success: Function, err: Function) => void;
    getFile: (fileName: string, fileParams: any, success: Function, err: Function) => void;
}

declare type DirectoryReader = {
    readEntries: (success: Function, err: Function) => void
}

declare type DirectoryContentEntry = any;
