//Handles HTML and wiring data
//Using Three v60

var events = new Events();

var UberVizMain = function() {

    function init() {
        AudioHandler.init();
        ControlsHandler.init();
        update();
    }

    function update() {
        requestAnimationFrame(update);
        events.emit("update");
    }

    return {
        init: init
    };

}();

$(document).ready(function() {
    UberVizMain.init();
});
