///<reference path="../interfaces/iclass.ts" />
///<reference path="html.ts" />

namespace KIP.Styles {

    /**...........................................................................
     * IStandardStyles
     * ...........................................................................
     * Keep track of a style definition 
     * ...........................................................................
     */
    export interface IStandardStyles {
        [selector: string]: TypedClassDefinition;
    }

    /**...........................................................................
     * IPlaceholderMatchFunction
     * ...........................................................................
     * 
     * ...........................................................................
     */
    export interface IPlaceholderMatchFunction {
        (valuePiece: string): number | string;
    }

    /**...........................................................................
     * TypeClassDefinition
     * ...........................................................................
     * Allow TS users to create a new class
     * ...........................................................................
     */
    export interface TypedClassDefinition extends IMappedType<CSSStyleDeclaration> {
        WebkitAppearance?: string;
        appearance?: string;
        nested?: IStandardStyles;
        from?: TypedClassDefinition;
        to?: TypedClassDefinition;
        objectFit?: string;
        src?: string;
    }

    /**...........................................................................
     * IThemeColors
     * ...........................................................................
     * Keeps track of the appropriate theme colors
     * ...........................................................................
     */
    export interface IThemeColors {
        [id: string]: string;
    }

    interface ICreatedStyles {
        [key: string]: boolean;
    }

    export interface IFontFaceDefinition {
        url: string;
        format: string;
    }

    export interface ICustomFonts {
        [fontName: string]: IFontFaceDefinition[];
    }

    /**...........................................................................
     * @class Stylable
     * Creates an element that can additionally add CSS styles
     * @version 1.0
     * ...........................................................................
     */
    export abstract class Stylable extends NamedClass {

        //#region STATIC PROPERTIES

        /** create the collection of all styles that have been added to the page */
        private static _pageStyles: IStandardStyles = {};

        /** keep track of all of the classes without the color substitutions */
        private static _uncoloredPageStyles: IStandardStyles = {};

        /** keep track of all of the theme colors for each of the classes */
        private static _themeColors: IThemeColors = {};

        /** hold the style tag containing our css class */
        private static _styleElem: HTMLStyleElement;

        /** keep track of the styles we've already created */
        private static _createdStyles: ICreatedStyles = {};

        /** keep track of the custom fonts for the page */
        private static _customPageFonts: ICustomFonts = {};

        //#endregion

        //#region INSTANCE PROPERTIES

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
        protected _colors: string[];

        /** keep track of whether we've initialized our styles */
        protected _hasCreatedStyles: boolean;

        //#endregion

        /**...........................................................................
         * Creates a stylable class
         * ...........................................................................
         */
        constructor() {
            super("Stylable");
            this._colors = [];
            // TODO: Check if we should actually be conditionally declaring our static variables in the constructor

            // Create the styles
            this._createStyles();
            this._hasCreatedStyles = true;
        }

        /**...........................................................................
         * setThemeColor
         * ...........................................................................
         * Update a theme color based on placeholders
         * 
         * @param   idx             The index of the theme color 
         * @param   color           The color to replace it with
         * @param   noReplace       True if we shouldn't replace an existing color
         * ...........................................................................
         */
        public setThemeColor(idx: number, color: string, noReplace?: boolean): void {

            // Quit if we're missing the color
            if (!color) { return; }

            // Calculate the appropriate name of the index
            let colorId: string = this._buildThemeColorId(idx);

            // Quit if the color is already set to any value
            if (noReplace && Stylable._themeColors[colorId]) { return; }

            // Replace the color stored in our array
            Stylable._themeColors[colorId] = color;

            // update the styles 
            Stylable._updateAllThemeColors();

            // Create the appropriate style classes out of it
            Stylable._createStyles(true);
        }

        /**...........................................................................
         * _buildThemeColorId
         * ...........................................................................
         * Create a unique ID for a color for a particular class
         * 
         * @param   idx         The index of the color 
         * @param   uniqueID    Optional name to use instead of the class name
         * 
         * @returns The created color ID
         * ...........................................................................
         */
        protected static _buildThemeColorId (idx: number, uniqueId: string): string {
            let outStr: string = format("<{0}|{1}>", uniqueId, idx.toString());
            return outStr;
        }

        /**...........................................................................
         * _buildThemeColorId
         * ...........................................................................
         * Create a unique ID for a color for a particular class
         * 
         * @param   idx         The index of the color 
         * @param   uniqueID    Optional name to use instead of the class name
         * 
         * @returns The created color ID
         * ...........................................................................
         */
        protected _buildThemeColorId (idx: number, uniqueId?: string): string {
            return Stylable._buildThemeColorId(idx, uniqueId || (this.constructor as any).name);
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
        protected static _mergeThemes(...styles: IStandardStyles[]): IStandardStyles {
            let flatStyles: IStandardStyles[] = [];
            let style: IStandardStyles;
            for (style of styles) {
                let flatStyle: IStandardStyles = this._cleanStyles(style);
                flatStyles.push(flatStyle);
            }
            return this._combineThemes.apply(this, flatStyles);
        }

        /**...........................................................................
         * _combineThemes
         * ...........................................................................
         * @param   themes  The themes to combine
         * @returns The merged themes
         * ...........................................................................
         */
        private static _combineThemes(...themes: IStandardStyles[]): IStandardStyles {
            let out: IStandardStyles = {};

            // Go through each of the themes
            themes.map((style: IStandardStyles) => {

                // then through each of the selectors
                map(style, (def: TypedClassDefinition, selector: string) => {

                    // initialise the properties for this selector if not already created
                    if (!out[selector]) { out[selector] = {}; }

                    // and last through all of the properties
                    map(def, (val: string, property: string) => {
                        out[selector][property] = val;
                    });
                    
                });
            });

            return out;
        }

        /**...........................................................................
         * _mergeThemes
         * ...........................................................................
         * Instance class to merge different themes
         * 
         * @param   themes  The themes to merge
         * 
         * @returns The merged themes 
         * ...........................................................................
         */
        protected _mergeThemes(...themes: IStandardStyles[]): IStandardStyles {
            return Stylable._mergeThemes.apply(Stylable, themes);
        }

        /**...........................................................................
         * _mergeIntoStyles
         * ...........................................................................
         * Add a new set of styles into the set of page styles
         * 
         * @param   styles  The styles to merge
         * ...........................................................................
         */
        protected static _mergeIntoStyles(styles: IStandardStyles): void {
            this._uncoloredPageStyles = this._mergeThemes(this._uncoloredPageStyles, styles);
            this._updateAllThemeColors();
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

        /**...........................................................................
         * _updateAllThemeColors
         * ...........................................................................
         * Make sure we have an updated version of our styles
         * ...........................................................................
         */
        protected static _updateAllThemeColors(): void {
            let styles: IStandardStyles = cloneObject(this._uncoloredPageStyles);
            let updateAll: boolean = Stylable._handleUpdatingThemeColor(styles);

            this._pageStyles = styles;

            if (!updateAll) { return; }
            this._createStyles();
        }

        /**...........................................................................
         * _handleUpdatingThemeColor
         * ...........................................................................
         * Make sure any changes to theme colors are handled elegantly
         * 
         * @param   styles  The styles to update 
         * 
         * @returns True if an update was made
         * ...........................................................................
         */
        protected static _handleUpdatingThemeColor(styles: IStandardStyles, updatedPlaceholder?: string): boolean {
            // Only update the full classes if something actually changed
            let updateAll: boolean = false;
            
            // loop through each of the style definitions
            map(styles, (cssDeclaration: TypedClassDefinition, selector: string) => {

                // loop through each property on this particular class
                map(cssDeclaration, (value: any, key: string) => {

                    if (typeof value === "object") { return; }

                    // Split each value & assume we won't replace anything
                    let valArray: string[] = value.split(" ");
                    let replaced: boolean = false;

                     // Loop through the split value
                    valArray.map((val: string, idx: number) => {                     

                        // Check if this is a placeholder & quit if it isn't
                        let placeholder: string = this._matchesPlaceholder(val);      
                        if (placeholder === "") { return; }                           

                        // If we have an appropriate color, replace it
                        if (this._themeColors["<" + placeholder + ">"]) {                         
                            valArray[idx] = this._themeColors["<" + placeholder + ">"];          
                            replaced = true;                                         
                            updateAll = true;

                        // otherwise, if we're updating placeholders and this needs updating, do so
                        } else if (updatedPlaceholder) {                                
                            if (!isNaN(+placeholder)) {
                                valArray[idx] = this._buildThemeColorId(+placeholder, updatedPlaceholder);
                                replaced = true;
                                updateAll = true;
                            }
                        }
                    }); 

                    // Quit if we didn't replace anything
                    if (!replaced) { return; }                                        

                    // Replace the value with the new color
                    styles[selector][key] = valArray.join(" ");                       
                });

            });

            return updateAll;
        }

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
            let fonts: ICustomFonts = Stylable._customPageFonts;

            // If we don't have any styles, just quit
            if (!styles) { return; }

            // Create the HTML style tag if we need to
            if (!this._styleElem) {
                this._styleElem = _createStyleElement(false);
                document.head.appendChild(this._styleElem);
            } else {
                this._styleElem.innerHTML = "";
            }

            // add the font-family pieces
            map(fonts, (fontDef: IFontFaceDefinition[], fontName: string) => {
                let tmpElem: HTMLStyleElement = createFontDefinition(fontName, fontDef);
            });

            // create all of the individual styles
            map(styles, (cssDeclaration: Styles.TypedClassDefinition, selector: string) => {
                let tmpElem: HTMLStyleElement = Styles.createClass(selector, cssDeclaration, true, forceOverride);
                if (!tmpElem) { return; }
                this._styleElem.innerHTML += tmpElem.innerHTML;
            });

        }

        /**...........................................................................
         * _createStyles
         * ...........................................................................
         * Create the styles for this class 
         * @param   forceOverride   True if we should create the classes even if they 
         *                          already exist
         * ...........................................................................
         */
        protected _createStyles(forceOverride?: boolean): void {
            // Quit if we don't have the right styles
            if (!this.uncoloredStyles) { return; }

            // If we've already created styles for these elements, don't do it again
            if ((Stylable._createdStyles[(this.constructor as any).name]) && !forceOverride) { return; }

            // Copy our styles & replace the wrong tags
            let tmpStyles: IStandardStyles = cloneObject(this.uncoloredStyles);
            tmpStyles = this._cleanStyles(tmpStyles);
            Stylable._handleUpdatingThemeColor(tmpStyles, (this.constructor as any).name);

            // Merge into the static styles
            Stylable._mergeIntoStyles(tmpStyles);  
            
            // Handle the fonts as well
            let customFonts: ICustomFonts = cloneObject(this._customFonts);
            Stylable._mergeIntoFonts(customFonts);

            // create all styles for the element
            Stylable._createStyles(forceOverride);

            Stylable._createdStyles[(this.constructor as any).name] = true;

        }

        /**...........................................................................
         * _cleanStyles
         * ...........................................................................
         * Clean the nested styles data so that we can parse it properly
         * @param   styles  The styles to clean
         * @returns The cleaned styles
         * ...........................................................................
         */
        protected _cleanStyles(styles: IStandardStyles, lastSelector?: string): IStandardStyles {
            return Stylable._cleanStyles(styles, lastSelector);
        }

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
                    outStyles = this._combineThemes(outStyles, calculatedStyles);
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
                    topStyles = this._combineThemes(topStyles, subnestedStyles);

                } else {
                    topStyles[selector][propertyName] = propertyValue;
                }
            });

            return topStyles;
        }

        /**...........................................................................
         * _matchesNumericPlaceholder
         * ...........................................................................
         * Checks if a particular string is a placeholder for a theme color
         * @param   valuePiece  The value to check for any placeholder
         * @returns The placeholder ID
         * ...........................................................................
         */
        protected static _matchesPlaceholder(valuePiece: string): string {
            let placeholderRegex: RegExp = /<(.+?)>/;
            let result: RegExpExecArray = placeholderRegex.exec(valuePiece);
            if (!result || !result[1]) { return ""; }
            return result[1];
        }

        /**...........................................................................
         * _applyColors
         * ...........................................................................
         * Apply the appropriate theme colors
         * @param   otherElem   If passed in, sets a theme color on a different element
         * ...........................................................................
         */
        protected _applyColors(otherElem?: Stylable): void {

            let idx: number = 0;
            for (idx; idx < this._colors.length; idx += 1) {
                if (!this._colors[idx]) { continue; }
                if (!otherElem) {
                    this.setThemeColor(idx, this._colors[idx], true);
                } else {
                    otherElem.setThemeColor(idx, this._colors[idx]);
                }
            }
        }
    }
    //#endregion

    //#region HANDLE THE CLASS CREATION

    /**...........................................................................
     * createClass
     * ...........................................................................
     * Create a CSS class from a selector & set of attributes
     * @param   selector        The CSS selector we should use for this class
     * @param   attr            Attributes that should be 
     * @param   noAppend        If true, doesn't add the style class to the document
     * @param   forceOverride   If true, replaces the class even if it already exists 
     * @returns The created style element
     * ...........................................................................
     */
    export function createClass(selector: string, attr: TypedClassDefinition, noAppend?: boolean, forceOverride?: boolean): HTMLStyleElement {
        let cls: HTMLStyleElement;
        let a: string;
        let styleString: string = "";
        let isGeneratingAnimation: boolean = (selector.indexOf("@keyframes") !== -1)

        // If this style already exists, append to it
        let cssRule: CSSStyleRule = _getExistingSelector(selector);
        if (!cssRule) { cssRule = { style: {} } as CSSStyleRule; }

        // Loop through the attributes we were passed in to create the class
        styleString += "\n" + selector + " {\n";

        let addedSomething: boolean = false;
        map(attr, (propertyValue: any, propertyName: string) => {
                // quit if this rule has already been added for this selector
                if (cssRule.style[propertyName]) { return; }
                if (attr[propertyName] === "theme") { return; }
                if (attr[propertyName] === "subTheme") { return; }

                if (selector.indexOf("@keyframes") !== -1) {
                    styleString += "\t" + propertyName + " {\n";
                    map(attr[propertyName], (pValue: any, pName: string) => {
                        styleString += "\t\t" + pName + " : " + pValue + ";\n"
                    });
                    styleString += "}";
                    addedSomething = true;
                } else {
                    styleString += "\t" + getPropertyName(propertyName) + " : " + attr[propertyName] + ";\n";
                    addedSomething = true; 
                }
        });
        styleString += "\n}";

        // If we created an empty class, just return nothing
        if (!addedSomething && !forceOverride) { return null; }

        // Append the class to the head of the document
        cls = _createStyleElement(!noAppend);
        cls.innerHTML += styleString;

        if (!noAppend) {
            
            if (!cls.parentNode) { document.head.appendChild(cls); }
        }

        // Return the style node
        return cls;
    }

    /**...........................................................................
     * _createStyleElement
     * ...........................................................................
     * Create the element that will then be added to the document 
     * @param   findExisting    If true, returns the first existing style tag in the document
     * @returns The created style element
     * ...........................................................................
     */
    function _createStyleElement(findExisting?: boolean): HTMLStyleElement {
        let styles: NodeList;
        let cls: HTMLStyleElement;

        // try to find an existing tag if requested
        if (findExisting) {
            styles = document.getElementsByTagName("style");
            if (styles.length > 0) {
                cls = (<HTMLStyleElement>styles[0]);
                return cls;
            }
        }

        cls = document.createElement("style");
        cls.innerHTML = "";
        
        return cls;
    }

    /**...........................................................................
     * getPropertyName
     * ...........................................................................
     * grab the appropriate property name for the CSS class 
     * @param   jsFriendlyName      The JS version of a CSS property name, usually in camel-case
     * @returns The CSS version of the property name
     * ...........................................................................
     */
    export function getPropertyName(jsFriendlyName: string): string {
        if (jsFriendlyName.toLowerCase() === jsFriendlyName) { return jsFriendlyName; }

        let chars: string[] = jsFriendlyName.split("");
        let char: string;
        for (let idx = 0; idx < chars.length; idx++) {
            char = chars[idx];
            if (char.toLowerCase() !== char) {
                chars[idx] = "-" + char.toLowerCase();
            }
        }

        return chars.join("");
    }

    /**...........................................................................
     * buildClassString
     * ...........................................................................
     * return the appropriate class 
     * 
     * @param   classes     List of all classes that should be combined into a 
     *                      single class name
     * 
     * @returns The full class name
     * ...........................................................................
     */
    export function buildClassString(...classes: string[]): string {
        let outCls: string = "";
        for (let idx = 0; idx < classes.length; idx += 1) {
            if (!classes[idx]) { continue; }

            if (outCls.length > 0) { outCls += " "; }
            outCls += classes[idx];
        }
        return outCls;
    }

    /**...........................................................................
     * _getExistingSelector
     * ...........................................................................
     * 
     * @param selector 
     * ...........................................................................
     */
    function _getExistingSelector(selector: string): CSSStyleRule {
        let css: string;
        let rules: CSSRuleList;
        let rule: CSSStyleRule;

        // Loop through all of the stylesheets we have available
        for (let sIdx = 0; sIdx < document.styleSheets.length; sIdx += 1) {
            
            // Pull in the appropriate index for the browser we're using
            css = document.all ? 'rules' : 'cssRules';  //cross browser
            try {
                rules = document.styleSheets[sIdx][css];
            } catch (err) {
                continue;
            }

            // If we have an index...
            if (rules) {

                // ... loop through all and check for the actual class
                for (let i = 0; i < rules.length; i += 1) {

                    rule = (<CSSStyleRule>rules[i]);

                    // If we find the class...
                    if (rule.selectorText === selector) {
                        return rule;
                    }
                }
            }
        }
    }

    /**...........................................................................
     * createFontDefinition
     * ...........................................................................
     * Adds a font to the CSS styles 
     * @param   fontName    The referencable name for the font
     * @param   srcFiles    The source files for this font
     * @returns The updated style element
     * ...........................................................................
     */
    export function createFontDefinition(fontName: string, srcFiles: IFontFaceDefinition[], noAppend?: boolean, forceOverride?: boolean) : HTMLStyleElement {
        let src: string[] = [];
        for (let srcFile of srcFiles) {
            src.push(format("url({0}) format({1})", srcFile.url, srcFile.format));
        }

        let attr: TypedClassDefinition = {
            fontFamily: fontName,
            src: src.join(",")
        };

        return createClass("@font-face", attr, noAppend, forceOverride);
    }
}