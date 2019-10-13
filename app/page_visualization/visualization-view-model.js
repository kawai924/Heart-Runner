var observable = require("tns-core-modules/data/observable");
const platformModule = require("tns-core-modules/platform");
var orientationModule = require("nativescript-screen-orientation");

var {
    Bluetooth
} = require('nativescript-bluetooth');
const bluetooth = new Bluetooth();

var VisualizationViewModel = (function (_super) {
    __extends(VisualizationViewModel, _super);
    // VisualizationViewModel.prototype.players = [];
    VisualizationViewModel.prototype.displacement = 0;

    function VisualizationViewModel(args) {
        _super.call(this);
        orientationModule.setCurrentOrientation("landscape");
        // TODO: KEEP THIS
        //this.playerList = args.object.navigationContext.playerList

        // TODO: TESTING PERIPHERALS
        this.playerList = [
            //     {
            //     name: "Yeet",
            //     peripheral: "C5:FE:55:09:15:E8",
            //     age: 23,
            //     max: 197
            // },
            {
                name: "Yeet",
                peripheral: "F5:F6:A8:45:46:67",
                age: 23,
                max: 197
            }, {
                name: "Yeet2",
                peripheral: "C3:8F:90:6F:27:F1",
                age: 23,
                max: 197
            }
        ]



    }

    VisualizationViewModel.prototype.getDimension = function (args) {
        // Getting Frame Object
        var page = args.object.page;
        // Setting the displacement to 1/4 of screen size
        VisualizationViewModel.prototype.displacement = platformModule.screen.mainScreen.heightPixels / 4;
        // Properly Scale the Mountain
        page.addCss("#mountain {height:" + platformModule.screen.mainScreen.heightPixels + "px; width:" + platformModule.screen.mainScreen.widthPixels + "px;}")
        // Hide Start Button Command
        page.addCss("#start {visibility: collapse;}")
        // Iterate through all registered players
        for (var i = 0; i < this.playerList.length; i++) {
            page.addCss(`#player${i+1}{ top:${platformModule.screen.mainScreen.heightPixels - VisualizationViewModel.prototype.displacement -50}px; 
                                        opacity:1; 
                                        height:${VisualizationViewModel.prototype.displacement}px; 
                                        width:${VisualizationViewModel.prototype.displacement}px;}`);
        }
        // Begin to connect each device individually
        VisualizationViewModel.prototype.connectDevice(this.playerList, this.playerList.length - 1, page)
    }

    VisualizationViewModel.prototype.connectDevice = function (playerList, i, page) {
        const actualDisplacement = platformModule.screen.mainScreen.heightPixels - VisualizationViewModel.prototype.displacement;
        bluetooth.connect({
            // TODO: change to peripheral.UUID
            UUID: playerList[i].peripheral,
            onConnected: function (peripheral) {
                bluetooth.startNotifying({
                    peripheralUUID: peripheral.UUID,
                    serviceUUID: '180d',
                    characteristicUUID: '2a37',
                    onNotify: function (result) {
                        var view = new Int8Array(result.value);
                        var heartDisplacement = (playerList[i].max - (playerList[i].max * .7))
                        var ratioDisplacement = actualDisplacement / heartDisplacement;
                        console.log(i);
                        if (view[1] > (playerList[i].max * 0.7)) {
                            page.addCss("#player" + i + " { top:" + ((ratioDisplacement * (playerList[i].max - view[1])) - 50) + "px;}");
                            console.log("#player" + i + " { top:" + ((ratioDisplacement * (playerList[i].max - view[1])) - 50) + "px;}" + " CURRENT HEART RATE: " + view[1]);
                        } else {
                            console.log("Heart Displacement" + ((ratioDisplacement * (playerList[i].max - view[1])) - 50));
                            console.log("Heart rate not high enough: " + view[1]);
                        }
                    }
                });
            },
            onDisconnected: function (peripheral) {
                console.log("Periperhal disconnected with UUID: " + peripheral.UUID);
            }
        });
        // Connect to the next device in the playerList
        if (i > 0)
            VisualizationViewModel.prototype.connectDevice(playerList, i - 1, page);
    }

    return VisualizationViewModel;
})(observable.Observable);

exports.visualizationViewModel = VisualizationViewModel;
