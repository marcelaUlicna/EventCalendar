/**
 * Created by Marcela on 5. 5. 2015.
 */

///<reference path="../typing/jquery.d.ts" />
///<reference path="../typing/bootstrap.d.ts" />
///<reference path="../typing/moment.d.ts" />
///<reference path="common.ts" />
///<reference path="helpers" />

module Calendar {

    /**
     * Implements modal dialog which contains selected start and end date,
     * component with events to be selected and inputs where user can type
     * some message for other person and/or note for himself. There is available
     * both Submit and Delete button and the cross for closing dialog without
     * applying any changes.
     *
     * @class Dialog
     * @constructor
     * @param {IModalDialog} dialogSettings - Modal dialog settings
     * @property {IModalDialog} dialogSettings - Modal dialog settings
     * @property {[key: string]: any} templateDictionary - Dictionary of placeholders and values necessary for rendering template
     * @property {JQuery} modal - Dialog element
     * @property {DialogResult} [dialogResult=DialogResult.Cancel] - Result of dialog event
     */
    export class Dialog {

        dialogSettings: IModalDialog;
        templateDictionary: { [key: string]: any };
        modal: JQuery;

        dialogResult: DialogResult = DialogResult.Cancel;

        constructor(dialogSettings: IModalDialog) {
            this.dialogSettings = dialogSettings;
            this.dialogSettings.selectedEvent = this.dialogSettings.events[0].name;
            this.templateDictionary = this.getDictionary();
        }

        /**
         * Fills `templateDictionary` with keys and its values.
         *
         * @method getDictionary
         * @private
         * @return {any} - Returns dictionary template
         */
        private getDictionary(): any {
            return {
                "title": "Modal title",
                "start": moment(this.dialogSettings.start).format("LL"),
                "end":  moment(this.dialogSettings.end).format("LL"),
                "dropdown": Calendar.ModalTemplate.dropdownTemplate(this.dialogSettings)
            };
        }

        /**
         * Renders modal dialog and binds all necessary events. After closing modal dialog
         * it is removed from DOM.
         *
         * @method show
         * @returns {JQueryPromise<DialogResult>} - Returns promise from modal dialog with dialog result
         */
        show(): JQueryPromise<DialogResult> {
            var deferred = $.Deferred<DialogResult>();

            this.modal = $(Calendar.Helpers.RenderTemplate(Calendar.ModalTemplate.template(), this.templateDictionary)).appendTo($("body"));
            this.modal.modal();
            this.modal.on("click", ".modal-body .dropdown-menu li", (e) => this.selectChange(e));
            this.modal.on("change", "input", (e) => this.messageChanged(e));
            this.modal.on("click", ".modal-body .btn-action", (e) => this.click(e));
            this.modal.on("hidden.bs.modal", () => {
                    this.modal.remove();
                    deferred.resolve(this.dialogResult);
                }
            );
            return deferred.promise();
        }

        /**
         * Resolves button click from dialog and calls appropriate method.
         *
         * @method click
         * @param {JQueryEventObject} e - Button object handler
         */
        click(e: JQueryEventObject): void {
            var action = $(e.target).attr("id");
            this[action](e);
            this.close();
        }

        /**
         * Sets dialogResult to `DialogResult.Submit`.
         *
         * @method btnSubmit
         * @param {JQueryEventObject} e - Button object handler
         */
        btnSubmit(e: JQueryEventObject): void {
            this.dialogResult = DialogResult.Submit;
        }

        /**
         * Sets dialogResult to `DialogResult.Delete`.
         *
         * @method btnDelete
         * @param {JQueryEventObject} e - Button object handler
         */
        btnDelete(e: JQueryEventObject): void {
            this.dialogResult = DialogResult.Delete;
        }

        /**
         * Sets dialogResult to `DialogResult.Cancel`.
         *
         * @method btnClose
         * @param {JQueryEventObject} e - Button object handler
         */
        btnClose(e: JQueryEventObject): void {
            this.dialogResult = DialogResult.Cancel;
        }

        /**
         * Closes modal dialog.
         *
         * @method close
         */
        close(): void {
            this.modal.modal("hide");
        }

        /**
         * Applies changes after selecting some event from list component,
         * saves selected item to `dialogSettings` property and
         * sets selected item to main button to reflect actual item.
         *
         * @method selectChange
         * @param {JQueryEventObject} e - Selected item event handler
         */
        selectChange(e: JQueryEventObject): void {
            var li = $(e.target).closest("li");

            this.dialogSettings.selectedEvent = li.attr("data-value");

            var html = li.find("a").html(),
                faIndex = html.indexOf("<i class"),
                htmlWithCaret = html.slice(0, faIndex) + " <span class='caret pull-right'></span>" + html.slice(faIndex);

            $(".calendar-modal .dropdown-toggle").html(htmlWithCaret);
        }

        /**
         * Saves input text to `dialogSettings` property.
         *
         * @method messageChanged
         * @param {JQueryEventObject} e - Input event handler
         */
        messageChanged(e:JQueryEventObject): void {
            var input = $(e.target);

            if(input.attr("name") === "userMessage") {
                this.dialogSettings.message = input.val();
            } else {
                this.dialogSettings.personalNote = input.val();
            }
        }
    }

    /**
     * Static class which contains templates for modal dialog
     *
     * @class ModalTemplate
     * @static
     */
    export class ModalTemplate {

        private static dropdownButton: string = [
            "<div class='btn-group' role='group'>",
            "   <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' aria-expanded='false'>",
            "       {{value}}",
            "       <span class='caret pull-right'></span>",
            "       <i class='fa fa-square pull-right' style='color: {{backgroundColor}}'></i>",
            "   </button>",
            "   <ul class='dropdown-menu' role='menu'>",
            "       {{dropdownlist}}",
            "   </ul>",
            "</div>"
        ].join("\n");

        private static dropdownList: string = "<li data-value='{{value}}'><a href='#'>{{value}}<i class='fa fa-square pull-right' style='color: {{backgroundColor}};'></i></a></li>";

        /**
         * Whole modal dialog html template.
         *
         * @method template
         * @static
         * @return {string} - Returns template
         */
        static template(): string {
            return  [
                "<div class='modal calendar-modal' tabindex='-1' role='dialog' aria-hidden='true'>",
                "  <div class='modal-dialog modal-sm'>",
                "    <div class='modal-content'>",
                "       <div class='modal-header'  style='border-bottom: none;'>",
                "           <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>",
                "       </div>",
                "       <div class='modal-body' style='padding-top: 0;'>",
                "           <div class='row' style='padding-bottom: 15px;'>",
                "               <div class='col-md-12'><i class='fa fa-calendar-o'></i> {{start}}</div>",
                "               <div class='col-md-12'><i class='fa fa-calendar-o'></i> {{end}}</div>",
                "           </div>",
                "           <div class='row' style='padding-bottom: 15px;'>",
                "               <div class='col-md-12'>{{dropdown}}</div>",
                "           </div>",
                "           <form>",
                "               <div class='form-group'>",
                "                   <div>Information (users will see this message)</div>",
                "                   <input type='text' name='userMessage' class='form-control'>",
                "               </div>",
                "               <div class='form-group'>",
                "                   <div>Notes (only you will see this message)</div>",
                "                   <input type='text' name='privateNote' class='form-control'>",
                "               </div>",
                "           </form>",
                "           <div class='row'>",
                "               <div class='col-md-12'>",
                "                   <button type='button' id='btnDelete' class='btn btn-default pull-left btn-action'>Delete</button>",
                "                   <button type='button' id='btnSubmit' class='btn btn-primary pull-right btn-action'>Submit</button>",
                "               </div>",
                "           </div>",
                "       </div>",
                "    </div>",
                "  </div>",
                "</div>"
            ].join("\n");
        }

        /**
         * Template for dropdown component with events.
         *
         * @method dropdownTemplate
         * @static
         * @param {IModalDialog} dialogSettings - Modal dialog settings
         * @return {string} - Returns partial template
         */
        static dropdownTemplate(dialogSettings: IModalDialog): string {
            var firstEvent = dialogSettings.events[0];

            var dropdownlist = dialogSettings.events.map((item) => {
                return Calendar.Helpers.RenderTemplate(this.dropdownList, {
                    "value": item.name,
                    "backgroundColor": item.backgroundColor || dialogSettings.defaultBgColor
                });
            });

            return Calendar.Helpers.RenderTemplate(this.dropdownButton, {
                "value": firstEvent.name,
                "backgroundColor": firstEvent.backgroundColor || dialogSettings.defaultBgColor,
                "dropdownlist": dropdownlist.join("")
            });
        }
    }
}