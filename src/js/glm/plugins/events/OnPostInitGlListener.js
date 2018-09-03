import {Event} from "glm-client-base";

export let _menuButtonExitPending;

/**
 * Handles functions relating to the postInitGl event.
 *
 * @author Tyler Bucher
 */
export class OnPostInitGlListener {

    /**
     * The callback function for the postInitGl event.
     *
     * @param {Event} event the event fired.
     */
    static handle(event) {
        let mapDiv     = $('#mapDiv');
        let menuButton = $.parseHTML('<button id="menuButton" type="button" class="btn btn-raised btn-primary sharp" ' +
            'data-toggle="modal" data-target="#menuModal">Menu<div class="ripple-container"></div></button>');
        mapDiv.append(menuButton);
        menuButton = $('#menuButton');
        menuButton.css('opacity', '0.5');
        menuButton.css('position', 'absolute');
        menuButton.css('right', '1.5625rem');
        menuButton.css('bottom', '1.5625rem');
        menuButton.css('background-color', 'rgb(51, 52, 51)');
        menuButton.css('color', 'rgb(216, 151, 71)');
        menuButton.mouseleave(function (event) {
            _menuButtonExitPending = setTimeout(function () {
                menuButton.fadeTo('slow', 0.5);
            }, 2000);
        });
        menuButton.mouseenter(function (event) {
            clearTimeout(_menuButtonExitPending);
            menuButton.fadeTo('fast', 1);
        });

        let menuModal = $.parseHTML(
            '<div id="menuModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="menuModal" aria-hidden="true" style="font-family: \'Open Sans\', sans-serif;">' +
            '<div class="modal-dialog modal-lg modal-dialog-centered">' +
            '<div class="modal-content" style="border-radius: 0;background: #333433;color: #CCC;">' +
            '<div class="modal-header">' +
            '<div style="border:0;border-bottom: 1px solid rgba(255,255,255,0.1);display: flex;width: 100%;">' +
            '<h5 class="modal-title" id="exampleModalLongTitle">MENU</h5>' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true" style="color: #ccc;text-shadow:none;">&times;</span>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div id="menuModalBody" class="modal-body">' +
            '<div class="container">' +
            '<div class="row">' +
            '<div class="col-md">' +
            '<div class="form-group">' +
            '<label for="serverSelect" class="bmd-label-floating">Selected Server</label>' +
            '<select class="form-control" id="serverSelect" style="line-height: 1.5;"></select>' +
            '</div>' +
            '</div>' +
            '<div class="col-md">' +
            '<div class="form-group">' +
            '<label for="worldSelect" class="bmd-label-floating">Selected World</label>' +
            '<select class="form-control" id="worldSelect" style="line-height: 1.5;"></select>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );
        mapDiv.append(menuModal);
        $('#menuModal').on('show.bs.modal', function (e) {
            let jQServerSelect = $('#serverSelect');
            let jQWorldSelect  = $('#worldSelect');
            jQServerSelect.empty();
            jQWorldSelect.empty();
            window.dataManager.serverMap.forEach(function (v, k, map) {
                let sel = '';
                // server
                if (window.dataManager.selectedServer === v) {
                    sel = 'selected';
                }
                jQServerSelect.append('<option value="' + k + '" ' + sel + ' style="color: black;">' + v.name + '</option>');
            });
            window.dataManager.selectedServer.worldMap.forEach(function (v, k, map) {
                let sel = '';
                if (window.dataManager.selectedWorld === v) {
                    sel = 'selected';
                }
                jQWorldSelect.append('<option value="' + k + '" ' + sel + ' style="color: black;">' + v.name + '</option>');
            });
        });
        $('#serverSelect').on('change', function () {
            let jQWorldSelect = $('#worldSelect');
            jQWorldSelect.empty();
            window.dataManager.selectedServer.worldMap.forEach(function (v, k, map) {
                let sel = '';
                if (window.dataManager.selectedWorld === v) {
                    sel = 'selected';
                }
                jQWorldSelect.append('<option value="' + k + '" ' + sel + ' style="color: black;">' + v.name + '</option>');
            });
        });
        $('#worldSelect').on('change', function () {
            window.dataManager.selectWorld($("#worldSelect option:selected").val());
        });
    }
}