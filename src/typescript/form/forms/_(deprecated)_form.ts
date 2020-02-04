/// <reference path="./embeddedForm.ts" />

namespace KIP.Forms {
    export class Form<T> extends EmbeddedForm<T> {
        
        /**
         * FOrm
         * ----------------------------------------------------------------------------
         * pass through to the appropriate new type of form
         */
        constructor(id: string, opts: IFormOptions, elems?: IFields<T>) {
            opts.id = id;
            super(opts, elems);

            if (opts.popupForm) { opts.style = FormStyleOptions.POPUP; }

            let out: _Form<T>;
            switch (opts.style) {
                case FormStyleOptions.INLINE:   
                    out = new InlineForm(opts, elems);
                    break;

                case FormStyleOptions.POPUP:
                    out = new PopupForm(opts, elems);
                    break;

                case FormStyleOptions.FULLSCREEN:
                    out = new FullScreenForm(opts, elems);
                    break;
            }

            return out;
        }
    }
}