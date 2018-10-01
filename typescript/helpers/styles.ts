///<reference path="../interfaces/iclass.ts" />
///<reference path="html.ts" />

namespace KIP.Styles {

    //....................................
    //#region INTERFACES AND DEFINITIONS

    /**
     * IStandardStyles
     * ----------------------------------------------------------------------------
     * Keep track of a style definition 
     */
    export interface IStandardStyles {
        [selector: string]: TypedClassDefinition;
    }

    /**
     * IPlaceholderMatchFunction
     * ----------------------------------------------------------------------------
     * Check if a particular placeholder matches the expected placeholder
     */
    export interface IPlaceholderMatchFunction {
        (valuePiece: string): number | string;
    }

    /**
     * TypeClassDefinition
     * ----------------------------------------------------------------------------
     * Allow TS users to create a new class
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

    /**
     * IThemeColors
     * ----------------------------------------------------------------------------
     * Keeps track of the appropriate theme colors
     */
    export interface IThemeColors {
        [id: string]: string;
    }

    /**
     * IFontFaceDefinition
     * ----------------------------------------------------------------------------
     * Declare particulars of custom fonts
     */
    export interface IFontFaceDefinition {
        url: string;
        format: string;
    }

    /**
     * ICustomFonts
     * ----------------------------------------------------------------------------
     * Define the custom fonts that should be part of this app
     */
    export interface ICustomFonts {
        [fontName: string]: IFontFaceDefinition[];
    }

    /**
     * IMediaQueries
     * ----------------------------------------------------------------------------
     * @deprecated
     * Track media queries separate from other CSS elements
     */
    export interface IMediaQueries {
        [screenSize: string]: IStandardStyles;
    }

    //#endregion
    //....................................

    //#region HANDLE THE CLASS CREATION

    /**
     * createClass
     * ----------------------------------------------------------------------------
     * Create a CSS class from a selector & set of attributes
     * 
     * @param   selector        The CSS selector we should use for this class
     * @param   attr            Attributes that should be 
     * @param   noAppend        If true, doesn't add the style class to the document
     * @param   forceOverride   If true, replaces the class even if it already exists 
     * 
     * @returns The created style element
     */
    export function createClass(selector: string, attr: TypedClassDefinition, noAppend?: boolean, forceOverride?: boolean, skipExistingSelector?: boolean): HTMLStyleElement {

        // generate the contents of the class to created
        let styleString: string = _generateContentForCSSClass(selector, attr, skipExistingSelector);

        // If we created an empty class, just return nothing
        if (!styleString && !forceOverride) { return null; }

        // add the class to an element & return it
        return _addClassToElem(styleString, noAppend);
    }

    /**
     * _generateContentForCSSClass
     * ----------------------------------------------------------------------------
     * Create the inner HTML for the CSS class that will be used for this styleset
     * @param   selector                CSS selector
     * @param   attr                    Properties + values to use for class
     * @param   skipExistingSelector    True if we should not add to an existing selector
     * 
     * @returns Appropriate content for the CSS class specified by the definition
     */
    function _generateContentForCSSClass(selector: string, attr: TypedClassDefinition, skipExistingSelector?: boolean): string {

        // generate the style string from our attributes
        let styleString = _generateCSSStringContent(selector, attr, skipExistingSelector);

        // as long as we have some value, format it appropriately as a class
        if (styleString) { 
            styleString = format("\n{0} \\{\n{1}\n\\}", selector, styleString);

            // allow for irregular formations, like media queries
            if (selector.indexOf("{") !== -1) { styleString += "\n}"; }
        }
        
        return styleString;
    }

    /**
     * _generateCSSStringContent
     * ----------------------------------------------------------------------------
     * Create the string that will actually fill the CSS class
     */
    function _generateCSSStringContent(selector: string, attr: TypedClassDefinition, skipExistingSelector: boolean): string {

        // If this style already exists, append to it
        let cssRule: CSSStyleRule = _getCSSRule(selector, skipExistingSelector);

        // determine whether this is an animation
        let isGeneratingAnimation: boolean = (selector.indexOf("@keyframes") !== -1);

        // initialize to null string
        let styleString: string = "";

        // loop through all of the properties and generate appropriate value strings
        map(attr, (propertyValue: any, propertyName: string) => {

            // quit if this rule has already been added for this selector
            if (cssRule.style[propertyName]) { return; }

            // generate the appropriate value string
            if (isGeneratingAnimation) { styleString += _generateAnimationClass(propertyName, propertyValue); } 
            else { styleString += _generateSimpleValue(propertyName, propertyValue); }

        });

        return styleString;
    }

    /**
     * _getCSSRule
     * ----------------------------------------------------------------------------
     * Get an existing selector, or spin up a new CSS Rule to use in our class def
     */
    function _getCSSRule(selector: string, skipExistingSelector: boolean): CSSStyleRule {
        let cssRule: CSSStyleRule;
        if (!skipExistingSelector) { cssRule = _getExistingSelector(selector); }
        if (!cssRule) { cssRule = { style: {} } as CSSStyleRule; }
        return cssRule;
    }

    /**
     * _generateAnimationClass
     * ----------------------------------------------------------------------------
     * Create the content needed to handle a CSS animation
     */
    function _generateAnimationClass(propertyName: string, propertyValue: any): string {
        
        let styleString: string = "";
        
        // loop through the nested values of the animation
        map(propertyValue, (pValue: any, pName: string) => {
            if (!pValue) { return; }
            styleString += "\t\t" + pName + " : " + pValue + ";\n"
        });

        // appropriately wrap the animation if we have anything to wrap
        if (styleString) {
            styleString = format("\t{0} \\{\n{1}\\}", propertyName, styleString);
        }

        return styleString;
    } 

    /**
     * _generateSimpleValue
     * ----------------------------------------------------------------------------
     * Create the content for a simple CSS property : value pair 
     */
    function _generateSimpleValue(propertyName: string, propertyValue: string): string {
        return format("\t{0} : {1};\n", getPropertyName(propertyName), propertyValue);
    }

    /**
     * _addClassToElem
     * ----------------------------------------------------------------------------
     * Add the appropriate class to the 
     */
    function _addClassToElem(content: string, noAppend: boolean): HTMLStyleElement {

        // Append the class to the head of the document
        let cls: HTMLStyleElement = createStyleElement(!noAppend);
        cls.innerHTML += content;

        // add the node to the document if appropriate
        if (!noAppend && !cls.parentNode) { document.head.appendChild(cls); }

        // Return the style node
        return cls;
    }

    /**
     * _createStyleElement
     * ----------------------------------------------------------------------------
     * Create the element that will then be added to the document 
     * @param   findExisting    If true, returns the first existing style tag in the document
     * @returns The created style element
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

    /**
     * getPropertyName
     * ----------------------------------------------------------------------------
     * grab the appropriate property name for the CSS class 
     * @param   jsFriendlyName      The JS version of a CSS property name, usually in camel-case
     * @returns The CSS version of the property name
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

    /**
     * buildClassString
     * ----------------------------------------------------------------------------
     * Builds the string version of a classname, out of multiple classes
     * 
     * @param   classes     List of all classes that should be combined into a 
     *                      single class name
     * 
     * @returns The full class name
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

    /**
     * _getExistingSelector
     * ----------------------------------------------------------------------------
     * Checks to find an already-existing version of this particular selector, so 
     * that the definitions can be combined
     * 
     * @param   selector    Selector to find
     * 
     * @returns Associated styles with this selector 
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

    /**
     * createFontDefinition
     * ----------------------------------------------------------------------------
     * Adds a font to the CSS styles 
     * 
     * @param   fontName    The referencable name for the font
     * @param   srcFiles    The source files for this font
     * 
     * @returns The updated style element
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

    /**
     * preemptivelyCreateStyles
     * ----------------------------------------------------------------------------
     * optional function that can generate a set of styles on page load, to speed 
     * up experience elsewhere
     * 
     * @param   constructor     Class constructor for the stylable to pre-initialize
     */
    export function preemptivelyCreateStyles(constructor: IConstructor<Stylable>): void {
        window.setTimeout(() => {
            new constructor();
        }, 0);
        
    }
}