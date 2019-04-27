/// <reference path="../interfaces/fileSystemAPI.d.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   FileStorage
     * ----------------------------------------------------------------------------
     * Allow storing into a local filesystem
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class _FileStorage {

        //.....................
        //#region PROPERTIES

        /** store the file system we work within, in order to be more efficient */
        protected _fileSystem;

        /** set a default storage size */
        protected readonly _DEFAULT_SIZE = 100 * 1024 * 1024;

        /** keep track of the file system type we are using */
        protected _fileSystemType: any;

        //#ndregion
        //.....................

        //...........................
        //#region PUBLIC FUNCTIONS

        /**
         * save
         * ----------------------------------------------------------------------------
         * Save a file to local storage
         * @param   fileName    The name of the file to save
         * @param   data        The data within the file to save
         */
        public async save(fileName: string, data: Blob, directoryPath?: string): Promise<boolean> {
            let fs = await this._getFileSystem();
            let dirEntry = await this._getDirectoryEntry(fs, directoryPath, true);
            let file = await this._createFile(dirEntry, fileName);
            let fw = await this._getFileWriter(file);
            let success = await this._writeFile(fw, file, data);
            return success;
        }

        /**
         * load
         * ----------------------------------------------------------------------------
         * Load a file from local storage
         * @param fileName 
         */
        public async load(fileName: string, directoryPath?: string): Promise<string> {
            let fs = await this._getFileSystem()
            let dirEntry = await this._getDirectoryEntry(fs, directoryPath, false);
            let fileEntry = await this._getFileEntry(dirEntry, fileName);
            let file = await this._getFile(fileEntry);
            let content = this._readFile(file);
            return content;
        }

        /**
        * deleteLocalFile
        * ----------------------------------------------------------------------------
        * @param directoryPath 
        * @param fileName 
        */
        public async deleteLocalFile(directoryPath: string, fileName: string): Promise<boolean> {
            let fs = await this._getFileSystem()
            let dirEntry = await this._getDirectoryEntry(fs, directoryPath, false);
            let fileEntry = await this._getFileEntry(dirEntry, fileName);
            let deleted = this._deleteFile(fileEntry);
            return deleted;
        }

        /**
         * createDirectory
         * ----------------------------------------------------------------------------
         * Create a local directory
         * @param   directoryPath   The name of the directory to create
         * @returns Promise that will create a directory
         * 
         */
        public async createDirectory(directoryPath: string): Promise<boolean> {
            let fs = await this._getFileSystem()
            let dirEntry = await this._getDirectoryEntry(fs, directoryPath, true);
            return !!dirEntry;
        }

        /**
         * getDirectory
         * ----------------------------------------------------------------------------
         * @param directoryPath 
         * 
         */
        public async getDirectory(directoryPath: string): Promise<DirectoryEntry> {
            let fs = await this._getFileSystem()
            let dirEntry = await this._getDirectoryEntry(fs, directoryPath);
            return dirEntry;
        }

        /**
         * getDirectoryContents
         * ----------------------------------------------------------------------------
         * Find everything that is directly a part of this directory
         * @param   directoryName   The directory to find
         *  
         */
        public async getDirectoryContents(directoryName: string, create?: boolean): Promise<DirectoryContentEntry[]> {
            let fs = await this._getFileSystem()
            let dirEntry = await this._getDirectoryEntry(fs, directoryName, create);
            let contents = await this._readDirectoryContents(dirEntry);
            return contents;
        }

        //#endregion
        //...........................

        //.....................
        //#region FILESYSTEM

        /**
         * _requestFileSystem
         * ----------------------------------------------------------------------------
         * Ensure we have a file system in order to kick off the request
         */
        protected async _getFileSystem(size?: number, type?: any): Promise<FileSystem> {

            // If we aren't resizing, just use the current file system
            if (this._fileSystem && !size) { return Promise.resolve(this._fileSystem); }

            // If this browser doesn't support file system, quit with an error
            (window as any).requestFileSystem = (window as any).requestFileSystem || (window as any).webkitRequestFileSystem;
            if (!requestFileSystem) { return Promise.reject("browser doesn't support file system"); }

            // if a size wasn't provided, set a default of 10mb
            if (!size) { size = this._DEFAULT_SIZE; }

            // if a type wasn't specified, default to persistent
            if (!type) { type = PERSISTENT; }
            this._fileSystemType = type;

            let quotaSize = await this._requestQuota(size)
            return await this._requestFileSystem(type, quotaSize);
        }

        /**
         * _requestQuota
         * ----------------------------------------------------------------------------
         * Request some storage for our app
         * @param size  The amount of storage to request, in bytes
         */
        protected _requestQuota(size: number): Promise<number> {
            return new Promise<number>((resolve, reject) => {

                // If it's Chrome, we need to get a quota
                try {
                    (window as any).webkitStorageInfo.requestQuota(
                        PERSISTENT, 
                        size, 
                        (grantedBytes: number) => {
                            resolve(grantedBytes);
                        }, 
                        (err: any) => {
                            this._handleError(err, reject);
                        }
                    );

                // If this failed, we don't need to request a quota
                } catch (e) {
                    resolve(size);
                }
            });
        }

        /**
         * _requestFileSystem
         * ----------------------------------------------------------------------------
         * Retrieve the local file system that we will be saving into
         */
        protected _requestFileSystem(type: any, size: number): Promise<FileSystem> {
            return new Promise((resolve, reject) => {
                requestFileSystem(
                    type,
                    size,
                    (fs: FileSystem) => {
                        this._fileSystem = fs;
                        resolve(this._fileSystem);
                    },
                    (err: any) => {
                        this._handleError(err, reject);
                    }
                );
            });
        }
        //#endregion
        //.....................

        //........................
        //#region FILE CREATION

        /**
         * _createFile
         * ----------------------------------------------------------------------------
         * Create a file with a particular name
         */
        protected async _createFile(dirEntry: DirectoryEntry, fileName: string): Promise<FileEntry> {
            return await this._getFileEntry(dirEntry, fileName, true);
        }

        /**
         * _getFileWriter
         * ----------------------------------------------------------------------------
         * return a promise that will retrieve a file writer
         */
        protected _getFileWriter(fileEntry: FileEntry): Promise<FileWriter> {
            return new Promise((resolve, reject) => {
                fileEntry.createWriter(
                    (writer: FileWriter) => { resolve(writer); },
                    (err: any) => { this._handleError(err, reject); }
                )
            });
        }

        /**
         * _writeFile
         * ----------------------------------------------------------------------------
         * Add details to a particular file
         * @param data 
         */
        protected _writeFile(writer: FileWriter, entry: FileEntry, data: Blob | string, append?: boolean): Promise<boolean> {
            return new Promise((resolve, reject) => {

                // handle when the file is done writing
                writer.onwriteend = () => {
                    if (writer.length === 0) {
                        writer.seek(0);
                        writer.write(data as Blob);
                    } else {
                        resolve(true);
                    }
                }

                // handle any errors that occur in writing
                writer.onerror = (err: any) => {
                    this._handleError(err, reject);
                }

                // If we are not appendind, clear the file then write via the onwriteend handler
                if (!append) {
                    writer.truncate(0);

                    // If we are appending, find the end of the file and and do so
                } else {
                    writer.seek(writer.length);
                    writer.write(data as Blob);
                }

            });
        }

        //#endregion
        //........................

        //........................
        //#region READ FILES

        /**
         * _getFileEntry
         * ----------------------------------------------------------------------------
         * Retrieve meta-details about a file
         */
        protected _getFileEntry(dir: DirectoryEntry, fileName: string, create?: boolean): Promise<FileEntry> {
            return new Promise((resolve: Function, reject: Function) => {
                dir.getFile(
                    fileName,
                    { create: create, exclusive: false },
                    (fileEntry: FileEntry) => {
                        resolve(fileEntry);
                    },
                    (err: any) => {
                        this._handleError(err, reject);
                    }
                )
            });
        }

        /**
         * _getFile
         * ----------------------------------------------------------------------------
         * Grab the file object within a FileEntry
         */
        protected _getFile(fileEntry: FileEntry): Promise<File> {
            return new Promise((resolve, reject) => {
                fileEntry.file(
                    (file: File) => { resolve(file); },
                    (err: any) => { this._handleError(err, reject); }
                );
            });
        }

        /**
         * _readFile
         * ----------------------------------------------------------------------------
         * Read the contents of a file into the resolve function
         */
        protected _readFile(file: File): Promise<string> {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();

                reader.onloadend = (e: Event) => {
                    resolve(reader.result as string);
                }

                reader.onerror = (err: any) => {
                    this._handleError(err, reject);
                }

                reader.readAsText(file);
            });
        }

        //#endregion
        //........................

        //.................................
        //#region DIRECTORY MANIPULATION

        /**
         * _getDirectoryEntry
         * ----------------------------------------------------------------------------
         * @param directoryName 
         * @param create 
         */
        protected async _getDirectoryEntry(fileSystem: FileSystem, directoryName?: string, create?: boolean): Promise<DirectoryEntry> {

            // make sure we don't have any characters we don't want in our directory name
            directoryName = _cleanDirectory(directoryName);

            // kick things off with the root director for the loaded file system
            let fsRoot = await this._getFileSystemRoot(fileSystem);

            // split the directory string to get the appropriate path
            // (for now handle either types of slashes)
            let curDir = fsRoot;
            let pathPieces: string[] = this._splitDirectoryPathPieces(directoryName);
            for (let pathPiece of pathPieces) {
                if (!pathPiece) { continue; }

                // create a promise to return this sub-directory
                curDir = await this._getSubDirectory(curDir, pathPiece, create);
            }

            // return the chained promises
            return curDir;
        }

        /**
         * _getFileSystemRoot
         * ----------------------------------------------------------------------------
         * Grab the root directory of our current file system
         */
        protected _getFileSystemRoot(fileSystem: FileSystem): Promise<DirectoryEntry> {
            return new Promise((resolve: Function, reject: Function) => {
                if (!fileSystem) { reject("No filesystem"); }
                resolve(fileSystem.root);
            });
        }

        /**
         * _splitDirectoryPathPieces
         * ----------------------------------------------------------------------------
         * Split a directory path into its relevant subpaths
         */
        protected _splitDirectoryPathPieces(directoryName: string) : string[] {
            if (!directoryName) { return []; }
            return directoryName.split(/[\/\\]/g);
        }

        /**
         * _getSubDirectory
         * ----------------------------------------------------------------------------
         * Find a nested directory
         */
        protected _getSubDirectory(directoryEntry: DirectoryEntry, subPath: string, create?: boolean): Promise<DirectoryEntry> {
            return new Promise((resolve: Function, reject: Function) => {
                directoryEntry.getDirectory(
                    subPath,
                    { create: create },
                    (dir: DirectoryEntry) => { resolve(dir); },
                    (err: any) => { reject(err); }
                )
            });
        }

        /**
         * _readDirectoryContents
         * ----------------------------------------------------------------------------
         * Find the contents of a particular directory
         */
        protected _readDirectoryContents(dirEntry: DirectoryEntry): Promise<DirectoryContentEntry[]> {
            return new Promise((resolve: Function, reject: Function) => {
                let reader: DirectoryReader = dirEntry.createReader();

                reader.readEntries(
                    (entries: DirectoryContentEntry[]) => { resolve(entries); },
                    (err: any) => { this._handleError(err, reject); }
                );
            });
        }

        //#endregion

        //.....................
        //#region DELETE FILE

        /**
         * _deleteFile
         * ----------------------------------------------------------------------------
         * delete a file from our system
         */
        protected _deleteFile(file: FileEntry): Promise<boolean> {
            return new Promise((resolve: Function, reject: Function) => {
                file.remove(
                    () => {
                        resolve(true);
                    },
                    (err: any) => {
                        this._handleError(err, reject);
                    }
                );
            });
        }

        //#endregion
        //.....................

        //..................
        //#region HELPERS

        /**
         * _handleError
         * ----------------------------------------------------------------------------
         * Log appropriate details when an error occurs
         */
        protected _handleError(err: any, reject?: Function): void {
            console.error(err);
            if (reject) { reject(err); }
        }

        //#endregion
        //..................
    }

    function _cleanDirectory(directoryName: string): string {
        let loopCnt = 0;

        // ensure that the directory path doesn't have any up-stream motions
        while (directoryName.indexOf("..") !== -1) {

            // replace any problematic character strings
            directoryName = directoryName.replace(/\.\./g, "");
            directoryName = directoryName.replace(/\/\//g, "/");
            directoryName = directoryName.replace(/\\\\/g, "\\");

            // verify we aren't in an infinite loop
            loopCnt += 1;
            if (loopCnt > 1000) { return ""; }
        }

        return directoryName;
    }

    export const FileStorage = new _FileStorage();
}