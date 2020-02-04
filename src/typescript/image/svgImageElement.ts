/// <reference path="../drawable/drawable.ts" />

namespace KIP {

    export async function embedSvgImage(src: string, style?: IPartial<Styles.TypedClassDefinition>): Promise<SVGElement> {
        let elem = createSVGElem({ type: "svg", style: style });
        let fc = await loadFileAsync(src);
        elem.innerHTML = fc;
        return elem;
    }
}