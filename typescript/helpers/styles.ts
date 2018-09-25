///<reference path="../interfaces/iclass.ts" />
///<reference path="html.ts" />

namespace KIP.Styles {

    //#region INTERFACES AND DEFINITIONS
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
        WebkitUserSelect?: string;
        MozUserSelect?: string;
        WebkitFilter?: string;
        khtmlUserSelect?: string;
        oUserSelect?: string;
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

    export interface IFontFaceDefinition {
        url: string;
        format: string;
    }

    export interface ICustomFonts {
        [fontName: string]: IFontFaceDefinition[];
    }

    export interface IMediaQueries {
        [screenSize: string]: IStandardStyles;
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
    export function createClass(selector: string, attr: TypedClassDefinition, noAppend?: boolean, forceOverride?: boolean, skipExistingSelector?: boolean): HTMLStyleElement {
        let cls: HTMLStyleElement;
        let a: string;
        let styleString: string = "";
        let isGeneratingAnimation: boolean = (selector.indexOf("@keyframes") !== -1);
        let containsCurlyBrace: boolean = (selector.indexOf("{") !== -1);

        // If this style already exists, append to it
        let cssRule: CSSStyleRule;
        if (!skipExistingSelector) { cssRule = _getExistingSelector(selector); }
        if (!cssRule) { cssRule = { style: {} } as CSSStyleRule; }

        // Loop through the attributes we were passed in to create the class
        styleString += "\n" + selector + " {\n";

        let addedSomething: boolean = false;
        map(attr, (propertyValue: any, propertyName: string) => {
                // quit if this rule has already been added for this selector
                if (cssRule.style[propertyName]) { return; }
                if (attr[propertyName] === "theme") { return; }
                if (attr[propertyName] === "subTheme") { return; }

                if (isGeneratingAnimation) {
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
        if (containsCurlyBrace) { styleString += "\n}"; }       // allow for irregular formations, like media queries

        // If we created an empty class, just return nothing
        if (!addedSomething && !forceOverride) { return null; }

        // Append the class to the head of the document
        cls = createStyleElement(!noAppend);
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
    export function createStyleElement(findExisting?: boolean): HTMLStyleElement {
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
    //#endregion

    // optional function that can generate a set of styles on page load, to speed up experience elsewhere
    export function preemptivelyCreateStyles(constructor: IConstructor<Stylable>): void {
        window.setTimeout(() => {
            new constructor();
        }, 0);
        
    }
}