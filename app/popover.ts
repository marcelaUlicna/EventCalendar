/**
 * Created by Marcela on 9. 5. 2015.
 */

///<reference path="../typing/jquery.d.ts" />
///<reference path="../typing/bootstrap.d.ts" />

module Calendar {

    /**
     * Implements bootstrap popover for each cell with any event.
     * Shows both message for other people and personal note if it is available.
     * It is triggered by hover.
     *
     * @class Popover
     * @static
     */
    export class Popover {
        private static messageTmp: string = "<div><i class='fa fa-comment-o'></i> {{message}}</div>";
        private static noteTmp: string = "<div><i class='fa fa-pencil-square-o'></i> {{note}}</div>";

        /**
         * Initializes popover for cell element.
         *
         * @method Popover
         * @static
         * @param {JQuery} cell - Cell element to apply popover
         * @param {string} [message] - Message text
         * @param {string} [note] - Note text for creator
         */
        static Popover(cell: JQuery, message?: string, note?:string): void {
            cell.popover({
                container: 'body',
                html: true,
                placement: 'top',
                trigger: 'hover',
                content: () => {
                    return this.template(message, note);
                }
            });
        }

        /**
         * Popover content.
         *
         * @method template
         * @static
         * @param {string} [message] - Message text
         * @param {string} [note] - Note text for creator
         * @return {string} - Template
         */
        static template(message?: string, note?:string): string {
            var messageTmp = message && message.length ? this.messageTmp.replace("{{message}}", message) : "",
                noteTmp = note && note.length ? this.noteTmp.replace("{{note}}", note) : "";

            return "<div>" + noteTmp + messageTmp + "</div>";
        }
    }
}

