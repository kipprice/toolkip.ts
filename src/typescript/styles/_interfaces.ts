namespace KIP.Styles {
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
        webkitLineClamp?: string;
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
     * 
     */
    export interface IMediaQueries {
        [screenSize: string]: IStandardStyles;
    }
}