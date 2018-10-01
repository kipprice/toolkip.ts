namespace KIP.Styles {

    interface ICreatedStyles {
        [key: string]: boolean;
    }

    /**----------------------------------------------------------------------------
     * @class Stylable
     * ----------------------------------------------------------------------------
     * Creates an element that can additionally add CSS styles
     * @author  Kip Price
     * @version 1.1.0
     * ----------------------------------------------------------------------------
     */
    export abstract class Stylable extends NamedClass {

        //...........................
        //#region STATIC PROPERTIES

        /** create the collection of all styles that have been added to the page */
        private static _pageStyles: IStandardStyles = {};

        /** hold the style tag containing our css class */
        private static _styleElem: HTMLStyleElement;

        /** keep track of all of the classes without the color substitutions */
        private static _themedStyles: IDictionary<IStandardStyles> = {};

        /** keep track of all of the theme colors for each of the classes */
        private static _themeColors: IThemeColors = {};

        /** hold the style tag that contains color-specific classes */
        private static _colorStyleElems: IDictionary<HTMLStyleElement> = {};

        /** keep track of the custom fonts for the page */
        private static _customPageFonts: ICustomFonts = {};

        /** keep track of the custom fonts */
        private static _customFontElem: HTMLStyleElement;

        /** keep track of the styles we've already created */
        private static _createdStyles: ICreatedStyles = {};

        //#endregion
        //...........................

        //........................
        //#region STATIC METHODS
        
        //.................................
        //#region COLOR-RELATED METHODS

        /**
         * _buildThemeColorId
         * ----------------------------------------------------------------------------
         * Create a unique ID for a color for a particular class
         * 
         * @param   idx         The index of the color 
         * @param   uniqueID    Optional name to use instead of the class name
         * 
         * @returns The created color ID
         */
        protected static _buildThemeColorId (uniqueId: string): string {
            let outStr: string = format("<{0}>", uniqueId);
            return outStr;
        }

        /**...........................................................................
         * _containedPlaceholder
         * ...........................................................................
         * check if a particular value string has a placeholder within it
         * @param   value   The value to check
         * @returns True if a placeholder is found
         * ...........................................................................
         */
        protected static _containedPlaceholder(value: string): string {
            let placeholderRegex: RegExp = /<(.+?)>/;
            let result: RegExpExecArray = placeholderRegex.exec(value);
            if (!result || !result[1]) { return ""; }
            return result[1];
        }

         /**...........................................................................
          * _findAllContainedPlaceholders
          * ...........................................................................
         * check if a particular value string has a placeholder within it
         * @param   value   The value to check
         * @returns True if a placeholder is found
         * ...........................................................................
         */
        protected static _findAllContainedPlaceholders(styles: IStandardStyles): string[] {
            // turn the styles into a string for ease of parsing
            let flatStyles: string = JSON.stringify(styles);
            
            // initialize some variables we need
            let out: string[] = [];
            let result: RegExpExecArray;

            // continue looping until we run out of regex matches
            let placeholderRegex: RegExp = /<(.+?)>/g;
            do {
                result = placeholderRegex.exec(flatStyles);
                if (!result) { break; }
                out.push(result[1]);
            } while (result); 

            // return all the matches we found
            return out;
        }

        /**...........................................................................
         * _updateAllThemeColors
         * ...........................................................................
         * Make sure we have an updated version of our styles
         * ...........................................................................
         */
        protected static _updateAllThemeColors(): void {
            map(this._themeColors, (value: IStandardStyles, themeColorId: string) => {
                this._updateThemeColor(themeColorId);
            });
        }

        /**
         * updates an individual theme color
         * @param   colorId     The color ID to update
         */
        protected static _updateThemeColor(colorId: string): void {
            let affectedStyles: IStandardStyles = cloneObject(this._themedStyles[colorId] || {});
            if (!affectedStyles) { return; }

            // loop through all classes tied to this color ID and update them
            map(affectedStyles, (def: TypedClassDefinition, selector: string) => {
                if (!def) { return; }
                this._updateColorInClassDefinition(def, colorId);
                affectedStyles[selector] = def;
            });

            // create the particular colors for this style
            this._createColoredStyles(affectedStyles, colorId, true);
        }

        /**
         * checks whether a color is replacing a current color ID in the definition
         * @param def 
         * @param colorId 
         */
        protected static _updateColorInClassDefinition(def: TypedClassDefinition, colorId: string): boolean {
            let color: string = this._themeColors[colorId];
            if (!color) { return; }

            let replacedAny: boolean = false;

            // loop through each property on this particular class
            map(def, (value: any, key: string) => {

                // skip transition values
                if (typeof value === "object") { return; }
                let replaced: boolean = false;

                // Split each value & assume we won't replace anything
                let valArray: string[] = value.split(" ");

                 // Loop through the split value
                valArray.map((val: string, idx: number) => {                     

                    if (this._containedPlaceholder(val) !== colorId) { return; }                     
                      
                    valArray[idx] = color;          
                    replaced = true; 
            
                }); 

                // Quit if we didn't replace anything
                if (!replaced) { 
                    delete def[key];
                    return; 
                }                                        

                // Replace the value with the new color
                def[key] = valArray.join(" ");     
                
                // let the return value that we replaced something
                replacedAny = true;
            });

            return replacedAny;
        }

        //#endregion
        //.................................

        //........................
        //#region MERGING THEMES

        /**...........................................................................
         * _mergeIntoStyles
         * ...........................................................................
         * Add a new set of styles into the set of page styles
         * 
         * @param   styles  The styles to merge
         * ...........................................................................
         */
        protected static _mergeIntoStyles(styles: IStandardStyles): void {
            // handle the non-colorables
            this._pageStyles = this._mergeThemes("", this._pageStyles, styles);

            // sort out the colorables
            this._themedStyles = this._mergeColorThemes(styles);
        }

        /**...........................................................................
         * _mergeThemes
         * ...........................................................................
         * Mere a set of themes into a single theme
         * 
         * @param   styles  Sets of themes that should be merged together
         * 
         * @returns The updated set of themes
         * ...........................................................................
         */
        protected static _mergeThemes(placeholderToMatch: string, ...styles: IStandardStyles[]): IStandardStyles {
            let flatStyles: IStandardStyles[] = [];
            let style: IStandardStyles;
            for (style of styles) {
                let flatStyle: IStandardStyles = this._cleanStyles(style);
                flatStyles.push(flatStyle);
            }
            return this._combineThemes(placeholderToMatch, ...flatStyles);
        }

        /**...........................................................................
         * _mergeColorThemes
         * ...........................................................................
         * Merge color specific style elements into our color arrays
         * @param   styles  Styles to combine into color-specific sets
         * @returns The created dictionary of theme specific colors 
         * ...........................................................................
         */
        protected static _mergeColorThemes(...styles: IStandardStyles[]): IDictionary<IStandardStyles> {
            let placeholders: string[];
            for (let style of styles) {
                placeholders = this._findAllContainedPlaceholders(style);
            }

            let handledPlaceholders: IDictionary<IStandardStyles> = {};
            for (let placeholder of placeholders) {

                // make sure we haven't handled this placeholder already
                if (handledPlaceholders[placeholder]) { continue; }

                // make sure we have a dictionary to save into
                if (this._themedStyles[placeholder]) { styles.push(this._themedStyles[placeholder]); }
                else { this._themedStyles[placeholder] = {}; }

                // merge back into the collective styles
                this._themedStyles[placeholder] = this._mergeThemes(placeholder, ...styles);
            }
            
            return this._themedStyles;
        }

        /**...........................................................................
         * _combineThemes
         * ...........................................................................
         * @param   themes  The themes to combine
         * @returns The merged themes
         * ...........................................................................
         */
        private static _combineThemes(placeholderToMatch: string, ...themes: IStandardStyles[]): IStandardStyles {
            let pageStyles: IStandardStyles = {};

            // Go through each of the themes
            themes.map((style: IStandardStyles) => {
                // then through each of the selectors
                map(style, (def: TypedClassDefinition, selector: string) => {

                    // create the styles that don't have colored aspects
                    if (!pageStyles[selector]) { pageStyles[selector] = {}; }
                    pageStyles[selector] = this._mergeDefinition(placeholderToMatch, def, pageStyles[selector]);
                    if (isEmptyObject(pageStyles[selector])) { delete pageStyles[selector]; }

                });
            });

            return pageStyles;
        }

        /**...........................................................................
         * _mergeDefinitions
         * ...........................................................................
         * merge a particular set of definitions
         * @param   definitions     The definitions to merge
         * @returns The merged set of definitions
         * ...........................................................................
         */
        private static _mergeDefinition(placeholderToMatch: string, ...definitions: TypedClassDefinition[]): TypedClassDefinition {
            let mergedDef: TypedClassDefinition = {}
            
            for (let def of definitions) {
                // and last through all of the properties
                map(def, (val: string, property: string) => {
                    let placeholder: string = this._containedPlaceholder(val);

                    // merge in only if it meets our current placeholder requirements
                    if (isNullOrUndefined(placeholderToMatch) || (placeholder === placeholderToMatch)) {
                        mergedDef[property] = val;
                    }
                });
            }

            return mergedDef;
        }

        /**...........................................................................
         * _mergeIntoFonts
         * ...........................................................................
         * @param fonts 
         * ...........................................................................
         */
        protected static _mergeIntoFonts(fonts: ICustomFonts): void {
            map(fonts, (fontDef: IFontFaceDefinition[], fontName: string) => {
                this._customPageFonts[fontName] = fontDef;
            });
        }
        //#endregion
        //........................

        //........................
        //#region CREATING STYLES

        /**...........................................................................
         * _createStyles
         * ...........................................................................
         * Create the styles for this class 
         * @param   forceOverride   True if we should create the classes even if they 
         *                          already exist
         * ...........................................................................
         */
        protected static _createStyles(forceOverride?: boolean): void {

            // grab our updated colors
            let styles: IStandardStyles = Stylable._pageStyles;
            this._styleElem = this._sharedCreateStyles(styles, this._styleElem, forceOverride);

            this._createFontStyles(forceOverride);

        }

        protected static _createFontStyles(forceOverride?: boolean): void {
            // add the font-family pieces
            let fonts: ICustomFonts = Stylable._customPageFonts;
            if (!this._customFontElem) { 
                this._customFontElem = createStyleElement(false); 
                document.head.appendChild(this._customFontElem);
            }
            this._customFontElem.innerHTML = "";

            map(fonts, (fontDef: IFontFaceDefinition[], fontName: string) => {
                let tmpElem: HTMLStyleElement = createFontDefinition(fontName, fontDef, true);
                this._customFontElem.innerHTML += tmpElem.innerHTML;
            });
        }

        /**...........................................................................
         * _createColoredStyles
         * ...........................................................................
         * Create all styles for color-affected classes
         * @param   forceOverride   If true, regenerates all styles for colors
         * ...........................................................................
         */
        protected static _createAllColoredStyles(forceOverride?: boolean): void {
            this._updateAllThemeColors();
        }

        /**...........................................................................
         * _createColorStyle
         * ...........................................................................
         * Create a particular color's style
         * @param   styles          The styles to create for this color
         * @param   colorId         The ID of the color
         * @param   forceOverride   If true, regenerates the classes for this color
         * ...........................................................................
         */
        protected static _createColoredStyles(styles: IStandardStyles, colorId: string, forceOverride?: boolean): void {
            let elem: HTMLStyleElement = this._colorStyleElems[colorId];
            this._colorStyleElems[colorId] = this._sharedCreateStyles(styles, elem, forceOverride);
        }

        /**...........................................................................
         * _sharedCreateStyles
         * ...........................................................................
         * Creates styles (either colored or not)
         * @param   styles   
         * @param   elem 
         * @param   forceOverride 
         * ...........................................................................
         */
        protected static _sharedCreateStyles(styles: IStandardStyles, elem: HTMLStyleElement, forceOverride?: boolean): HTMLStyleElement {
            if (!styles) { return; }

            // If we have an element, remove it
            if (elem) {
                window.setTimeout(() => { document.head.removeChild(elem); }, 100);
            }
            
            // spin up a new element to add these styles to
            let newElem = createStyleElement(false);
            document.head.appendChild(newElem);

            // create all of the individual styles
            map(styles, (cssDeclaration: Styles.TypedClassDefinition, selector: string) => {
                let tmpElem: HTMLStyleElement = Styles.createClass(selector, cssDeclaration, true, forceOverride, true);
                if (!tmpElem) { return; }
                newElem.innerHTML += tmpElem.innerHTML;
            });

            // return the new style element
            return newElem;

        }
        //#endregion
        //........................

        //........................
        //#region CLEANING STYLES
        /**...........................................................................
         * _cleanStyles
         * ...........................................................................
         * Clean the nested styles data so that we can parse it properly
         * @param   styles  The styles to clean
         * @returns The cleaned styles
         * ...........................................................................
         */
        protected static _cleanStyles(styles: IStandardStyles, lastSelector?: string): IStandardStyles {
            let outStyles: IStandardStyles = {} as any;
            map(styles, (value: TypedClassDefinition, selector: string) => {

                // split all selectors at commas so we can appropriately nest
                let newSelectors: string[] = selector.split(",");
                if (lastSelector) {
                    for (let i = 0; i < newSelectors.length; i += 1) {

                        let newSelector: string = newSelectors[i];

                        // handle selectors that are modifications of the last selector
                        if (newSelector[0] === "&") {
                            newSelectors[i] = lastSelector + rest(newSelector,1);
                        
                        // handle all other subclass cases
                        } else {
                            newSelectors[i] = lastSelector + " " + newSelector;
                        }
                    }
                }

                // loop through all of the available subclasses for this
                let subCls: string;
                for (subCls of newSelectors) {
                    let calculatedStyles: IStandardStyles = this._cleanClassDef(subCls, value);
                    outStyles = this._combineThemes(null, outStyles, calculatedStyles);
                }

            });
            return outStyles;
        }

        /**...........................................................................
         * _cleanClassDef
         * ...........................................................................
         * Clean a particular class definition recursively
         * @param   selector    The CSS selector for this class
         * @param   classDef    The definition for this CSS class
         * @returns The merged styles
         * ...........................................................................
         */
        protected static _cleanClassDef(selector: string, classDef: TypedClassDefinition): IStandardStyles {
            let topStyles: IStandardStyles = {} as any;
            topStyles[selector] = {} as TypedClassDefinition;

            map(classDef, (propertyValue: any, propertyName: string) => {

                // allow for animations to be created
                if (propertyName === "nested") {

                    let nestedStyles: IStandardStyles = propertyValue;

                    
                    let subnestedStyles = this._cleanStyles(propertyValue, selector);
                    topStyles = this._combineThemes(null, topStyles, subnestedStyles);

                } else {
                    topStyles[selector][propertyName] = propertyValue;
                }
            });

            return topStyles;
        }
        //#endregion
        //........................

        //#endregion
        //........................

        //................................................
        //#region INSTANCE OR CLASS-SPECIFIC PROPERTIES

        /** keep track of the styles defined by this class */
        private _styles: IStandardStyles;

        /** keep track of the un-themed version of our styles */
        protected static _uncoloredStyles: IStandardStyles;
        private get _uncoloredStyles(): IStandardStyles { return (this.constructor as typeof Stylable)._uncoloredStyles; }
        public get uncoloredStyles(): IStandardStyles { return this._getUncoloredStyles(); }

        /** overridable function to grab the appropriate styles for this particular class */
        protected _getUncoloredStyles(): IStandardStyles {
            return (this.constructor as typeof Stylable)._uncoloredStyles;
        }

        /** keep track of the fonts defined by this element */
        protected static _customFonts: ICustomFonts = {};
        private get _customFonts(): ICustomFonts { return (this.constructor as typeof Stylable)._customFonts; }
        public get customFonts(): ICustomFonts { return this._getCustomFonts(); }

        /** overridable function to grab the appropriate fonts for this particular class */
        protected _getCustomFonts(): ICustomFonts {
            return (this.constructor as typeof Stylable)._customFonts;
        }

        /** keep track of the initial set of colors */
        protected _colors: IDictionary<string>;

        /** keep track of whether we've initialized our styles */
        protected _hasCreatedStyles: boolean;

        //#endregion
        //................................................

        //...........................
        //#region INSTANCE METHODS

        /**
         * Stylable
         * ----------------------------------------------------------------------------
         * Creates a stylable class
         */
        constructor() {
            super("Stylable");
            this._colors = {};
            
            // Create the styles
            this._createStyles();
            this._hasCreatedStyles = true;
        }

        /**
         * _applyColors
         * ----------------------------------------------------------------------------
         * Apply the appropriate theme colors
         * @param   otherElem   If passed in, sets a theme color on a different element
         */
        protected _applyColors(otherElem?: Stylable): void {

            let idx: number = 0;
            map(this._colors, (color: string, uniqueId: string) => {
                if (!color) { return; }
                if (!otherElem) {
                    this.setThemeColor(uniqueId, color, true);
                } else {
                    otherElem.setThemeColor(uniqueId, color, true);
                }
            });
        }

        /**
         * setThemeColor
         * ----------------------------------------------------------------------------
         * Update a theme color based on placeholders
         * 
         * @param   uniqueId        The index of the theme color 
         * @param   color           The color to replace it with
         * @param   noReplace       True if we shouldn't replace an existing color
         */
        public setThemeColor(colorId: string, color: string, noReplace?: boolean): void {

            // Quit if we're missing the color or the ID
            if (!color || !colorId) { return; }

            // Quit if the color is already set to any value
            if (noReplace && Stylable._themeColors[colorId]) { return; }

            // Quit if this is already the color set for this element
            if (Stylable._themeColors[colorId] === color) { return; }

            // Replace the color stored in our array
            Stylable._themeColors[colorId] = color;

            // update the styles related to this particular theme
            Stylable._updateThemeColor(colorId);
        }

        /**
         * _buildThemeColorId
         * ----------------------------------------------------------------------------
         * Create a unique ID for a color for a particular class
         * 
         * @param   idx         The index of the color 
         * @param   uniqueID    Optional name to use instead of the class name
         * 
         * @returns The created color ID
         */
        protected _buildThemeColorId (uniqueId?: string): string {
            return Stylable._buildThemeColorId(uniqueId);
        }

        /**
         * _mergeThemes
         * ----------------------------------------------------------------------------
         * Instance class to merge different themes
         * 
         * @param   themes  The themes to merge
         * 
         * @returns The merged themes 
         */
        protected _mergeThemes(...themes: IStandardStyles[]): IStandardStyles {
            return Stylable._mergeThemes(null, ...themes);
        }

        /**
         * _createStyles
         * ----------------------------------------------------------------------------
         * Create the styles for this class 
         * @param   forceOverride   True if we should create the classes even if they 
         *                          already exist
         */
        protected _createStyles(forceOverride?: boolean): void {
            // Quit if we don't have the right styles
            if (!this.uncoloredStyles) { return; }

            // If we've already created styles for these elements, don't do it again
            if ((Stylable._createdStyles[(this.constructor as any).name]) && !forceOverride) { return; }

            // Copy our styles & replace the wrong tags
            let tmpStyles: IStandardStyles = cloneObject(this.uncoloredStyles);
            tmpStyles = this._cleanStyles(tmpStyles);

            // Merge into the static styles
            Stylable._mergeIntoStyles(tmpStyles);  
            
            // Handle the fonts as well
            let customFonts: ICustomFonts = cloneObject(this._customFonts);
            Stylable._mergeIntoFonts(customFonts);

            // create all styles for the element
            Stylable._createStyles(forceOverride);

            Stylable._createAllColoredStyles(forceOverride);

            Stylable._createdStyles[(this.constructor as any).name] = true;

        }

        /**
         * _cleanStyles
         * ----------------------------------------------------------------------------
         * Clean the nested styles data so that we can parse it properly
         * @param   styles  The styles to clean
         * @returns The cleaned styles
         */
        protected _cleanStyles(styles: IStandardStyles, lastSelector?: string): IStandardStyles {
            return Stylable._cleanStyles(styles, lastSelector);
        }

        //#endregion
        //...........................
    }
}