namespace KIP {

    /**----------------------------------------------------------------------------
     * @class	Trie
     * ----------------------------------------------------------------------------
     * Special form of tree that is really good at keeping track of words and 
     * prefixes
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export class Trie extends Tree<string> {

        //.....................
        //#region PROPERTIES
        
        protected _terminates: boolean;

        protected _subTrees: KIP.IDictionary<Trie>;
        
        //#endregion
        //.....................

        //..........................................
        //#region HANDLE ADDING WORDS
        
        public add(word: string): void {
            if (word.length === 0) {
                this._handleTerminatingWord();
            } else {
                this._handleNonTerminatingWord(word);
            }
        }

        protected _handleTerminatingWord(): void {
            this._terminates = true;
        }

        protected _handleNonTerminatingWord(word: string): void {
            let splitWord = this._splitWord(word);

            if (!this._subTrees[splitWord.firstChar]) {
                this._subTrees[splitWord.firstChar] = new Trie(splitWord.firstChar);
            }
            
            this._subTrees[splitWord.firstChar].add(splitWord.restOfWord);
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region REMOVE A WORD
        
        public remove (word: string): void {
            if (word.length === 0) {
                this._terminates = false;
            } else {
                let splitWord = this._splitWord(word);
                if (!this._subTrees[splitWord.firstChar]) { return; }
                this._subTrees[splitWord.firstChar].remove(splitWord.restOfWord);
            }
        }
        
        //#endregion
        //..........................................
        //..........................................
        //#region HANDLE FINDING A WORD
        
        public exists(word: string): boolean {
            if (word.length === 0) { return this._terminates; }

            let splitWord = this._splitWord(word);
            if (!this._subTrees[splitWord.firstChar]) { return false; }
            
            return this._subTrees[splitWord.firstChar].exists(splitWord.restOfWord);
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region HELPERS
        
        protected _splitWord(word: string): ISplitWord {
            return {
                firstChar : word.charAt(0),
                restOfWord: KIP.rest(word, 1)
            }
        }
        
        //#endregion
        //..........................................
    }

    //..........................................
    //#region TYPES AND INTERFACES
    
    interface ISplitWord {
        firstChar: string;
        restOfWord: string;
    }
    
    //#endregion
    //..........................................
}