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
    export class FileStorage {

        //.....................
        //#region PROPERTIES

        /** store the file system we work within, in order to be more efficient */
        protected static _fileSystem;

        /** set a default storage size */
        protected static readonly _DEFAULT_SIZE = 10 * 1024 * 1024;

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
        public static save(fileName: string, data: Blob, directoryPath?: string): KipPromise {
            return this._getFileSystem()
                .then(this._getDirectoryEntry(directoryPath, true))
                .then(this._createFile(fileName))
                .then(this._getFileWriter())
                .then(this._writeFile(data))
                .catch((err: any) => { this._handleError(err); })
        }

        /**
         * load
         * ----------------------------------------------------------------------------
         * Load a file from local storage
         * @param fileName 
         */
        public static load(fileName: string, directoryPath?: string): KipPromise {
            return this._getFileSystem()
                .then(this._getDirectoryEntry(directoryPath, false))
                .then(this._getFileEntry(fileName))
                .then(this._getFile())
                .then(this._readFile());
        }

        /**
        * deleteLocalFile
        * ----------------------------------------------------------------------------
        * @param directoryName 
        * @param fileName 
        */
        public static deleteLocalFile(directoryName: string, fileName: string): KipPromise {
            return this._getFileSystem()
                .then(this._getDirectoryEntry(directoryName, false))
                .then(this._getFileEntry(fileName))
                .then(this._deleteFile());
        }

        /**
         * createDirectory
         * ----------------------------------------------------------------------------
         * Create a local directory
         * @param   directoryName   The name of the directory to create
         * @returns Promise that will create a directory
         * 
         */
        public static createDirectory(directoryName: string): KIP.KipPromise {
            return this._getFileSystem()
                .then(this._getDirectoryEntry(directoryName, true));
        }

        /**
         * getDirectory
         * ----------------------------------------------------------------------------
         * @param directoryName 
         * 
         */
        public static getDirectory(directoryName: string): KIP.KipPromise {
            return this._getFileSystem()
                .then(this._getDirectoryEntry(directoryName, true));
        }

        /**
         * getDirectoryContents
         * ----------------------------------------------------------------------------
         * Find everything that is directly a part of this directory
         * @param   directoryName   The directory to find
         *  
         */
        public static getDirectoryContents(directoryName: string, create?: boolean): KIP.KipPromise {
            return this._getFileSystem()
                .then(this._getDirectoryEntry(directoryName, create))
                .then(this._readDirectoryContents());
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
        protected static _getFileSystem(size?: number): KipPromise {

            // If we aren't resizing, just use the current file system
            if (this._fileSystem && !size) { return KipPromise.resolve(this._fileSystem); }

            // If this browser doesn't support file system, quit with an error
            (window as any).requestFileSystem = (window as any).requestFileSystem || (window as any).webkitRequestFileSystem;
            if (!requestFileSystem) { return KipPromise.reject("browser doesn't support file system"); }

            // if a size wasn't provided, set a default of 10mb
            if (!size) { size = this._DEFAULT_SIZE; }

            return this._requestQuota(size)
                .then(this._requestFileSystem());
        }

        /**
         * _requestQuota
         * ----------------------------------------------------------------------------
         * Request some storage for our app
         * @param size  The amount of storage to request, in bytes
         */
        protected static _requestQuota(size: number): KipPromise {
            return new KipPromise((resolve, reject) => {

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
        protected static _requestFileSystem(): KipPromise {
            return new KipPromise((resolve: Function, reject: Function, size: number) => {
                
                requestFileSystem(
                    PERSISTENT,
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
        protected static _createFile(fileName: string): KipPromise {
            return this._getFileEntry(fileName, true);
        }

        /**
         * _getFileWriter
         * ----------------------------------------------------------------------------
         * return a promise that will retrieve a file writer
         */
        protected static _getFileWriter(): KipPromise {
            return new KipPromise(
                (resolve, reject, fileEntry: FileEntry) => {
                    fileEntry.createWriter(
                        (writer: FileWriter) => { resolve(writer, fileEntry) },
                        (err: any) => { this._handleError(err, reject); }
                    )
                },
                true
            );
        }

        /**
         * _writeFile
         * ----------------------------------------------------------------------------
         * Add details to a particular file
         * @param data 
         */
        protected static _writeFile(data: Blob | string, append?: boolean): KipPromise {
            return new KipPromise((resolve, reject, writer: FileWriter, entry: FileEntry) => {

                // handle when the file is done writing
                writer.onwriteend = () => {
                    if (writer.length === 0) {
                        writer.seek(0);
                        writer.write(data as Blob);
                    } else {
                        resolve(true, entry);
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

            }, true);
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
        protected static _getFileEntry(fileName: string, create?: boolean): KipPromise {
            return new KipPromise((resolve: Function, reject: Function, dir: DirectoryEntry) => {
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
            }, true);
        }

        /**
         * _getFile
         * ----------------------------------------------------------------------------
         * Grab the file object within a FileEntry
         */
        protected static _getFile(): KipPromise {
            return new KipPromise((resolve, reject, fileEntry: FileEntry) => {
                fileEntry.file(
                    (file: File) => { resolve(file); },
                    (err: any) => { this._handleError(err, reject); }
                );
            }, true);
        }

        /**
         * _readFile
         * ----------------------------------------------------------------------------
         * Read the contents of a file into the resolve function
         */
        protected static _readFile(): KipPromise {
            return new KipPromise((resolve, reject, file: File) => {
                let reader = new FileReader();
                reader.onloadend = (e: Event) => {
                    resolve(reader.result);
                }

                reader.onerror = (err: any) => {
                    this._handleError(err, reject);
                }

                reader.readAsText(file);
            }, true);
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
        protected static _getDirectoryEntry(directoryName?: string, create?: boolean): KipPromise {
            let promiseChain: PromiseChain = new PromiseChain();

            // make sure we don't have any characters we don't want in our directory name
            directoryName = _cleanDirectory(directoryName);

            // kick things off with the root director for the loaded file system
            promiseChain.addPromise(this._getFileSystemRoot());

            // split the directory string to get the appropriate path
            // (for now handle either types of slashes)
            let pathPieces: string[] = this._splitDirectoryPathPieces(directoryName);
            for (let pathPiece of pathPieces) {
                if (!pathPiece) { continue; }

                // create a promise to return this sub-directory
                promiseChain.addPromise(this._getSubDirectory(pathPiece, create));
            }

            // return the chained promises
            return promiseChain;
        }

        /**
         * _getFileSystemRoot
         * ----------------------------------------------------------------------------
         * Grab the root directory of our current file system
         */
        protected static _getFileSystemRoot(): KipPromise {
            return new KipPromise((resolve: Function, reject: Function, fileSystem: FileSystem) => {
                if (!fileSystem) { reject("No filesystem"); }
                resolve(fileSystem.root);
            }, true);
        }

        /**
         * _splitDirectoryPathPieces
         * ----------------------------------------------------------------------------
         * Split a directory path into its relevant subpaths
         */
        protected static _splitDirectoryPathPieces(directoryName: string) : string[] {
            if (!directoryName) { return []; }
            return directoryName.split(/[\/\\]/g);
        }

        /**
         * _getSubDirectory
         * ----------------------------------------------------------------------------
         * Find a nested directory
         */
        protected static _getSubDirectory(subPath: string, create?: boolean): KipPromise {
            return new KipPromise((resolve: Function, reject: Function, directoryEntry: DirectoryEntry) => {
                directoryEntry.getDirectory(
                    subPath,
                    { create: create },
                    (dir: DirectoryEntry) => { resolve(dir); },
                    (err: any) => { reject(err); }
                )
            }, true);
        }

        /**
         * _readDirectoryContents
         * ----------------------------------------------------------------------------
         * Find the contents of a particular directory
         */
        protected static _readDirectoryContents(): KipPromise {
            return new KipPromise((resolve: Function, reject: Function, dirEntry: DirectoryEntry) => {
                let reader: DirectoryReader = dirEntry.createReader();

                reader.readEntries(
                    (entries: DirectoryContentEntry[]) => { resolve(entries); },
                    (err: any) => { this._handleError(err, reject); }
                );
            }, true);
        }

        //#endregion

        //.....................
        //#region DELETE FILE

        /**
         * _deleteFile
         * ----------------------------------------------------------------------------
         * delete a file from our system
         */
        protected static _deleteFile(): KIP.KipPromise {
            return new KipPromise((resolve: Function, reject: Function, file: FileEntry) => {
                file.remove(
                    () => {
                        resolve(true);
                    },
                    (err: any) => {
                        this._handleError(err, reject);
                    }
                );
            }, true);
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
        protected static _handleError(err: any, reject?: Function): void {
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
}