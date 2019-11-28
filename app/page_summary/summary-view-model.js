var observable = require("tns-core-modules/data/observable");
const fileSystemModule = require("tns-core-modules/file-system");
var dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");

var SummaryViewModel = (function (_super) {
    __extends(SummaryViewModel, _super);
    SummaryViewModel.prototype.data = new observable.Observable();
    SummaryViewModel.prototype.players = [];
    SummaryViewModel.prototype.ipAddress = "http://192.168.254.13"
    function SummaryViewModel(args) {
        _super.call(this);
        SummaryViewModel.prototype.players = args.object.navigationContext.playerList;
        SummaryViewModel.prototype.saveData();
        SummaryViewModel.prototype.refresh(0);
    }
    SummaryViewModel.prototype.refresh = function (value) {
        var currentPlayer = SummaryViewModel.prototype.players[value]

        SummaryViewModel.prototype.data.set("currentPlayer", value);
        SummaryViewModel.prototype.data.set("currentData", currentPlayer.heartRate);
        SummaryViewModel.prototype.data.set("currentPlayerLabel", "Current Player: " + currentPlayer.name)
        var timeElapsed = Math.abs(new Date(currentPlayer.heartRate[0].time) - new Date(currentPlayer.heartRate[currentPlayer.heartRate.length-1].time));
        var secondsElapsed = Math.floor((timeElapsed/1000) %60);
        var minuteElapsed = Math.floor((timeElapsed/1000)/60)
        SummaryViewModel.prototype.data.set("time","Elapsed Time: " + minuteElapsed + ":" + (secondsElapsed<10? "0"+secondsElapsed: secondsElapsed))
        
        var red = 0,
            yellow = 0,
            green = 0;
        SummaryViewModel.prototype.players[SummaryViewModel.prototype.data.get("currentPlayer")].stars.forEach((element) => {
            if (element.star === "Red") {
                red++;
            } else if (element.star === "Yellow") {
                yellow++;
            } else {
                green++;
            }
        });
        SummaryViewModel.prototype.data.set("red", "Red Stars: " + red)
        SummaryViewModel.prototype.data.set("yellow", "Yellow Stars: " + yellow)
        SummaryViewModel.prototype.data.set("green", "Green Stars: " + green)

    }
    SummaryViewModel.prototype.changePlayer = function () {
        var currentData = SummaryViewModel.prototype.data.get("currentPlayer");
        if ((currentData + 1) === SummaryViewModel.prototype.players.length) {
            SummaryViewModel.prototype.data.set("currentPlayer", 0);
        } else {
            SummaryViewModel.prototype.data.set("currentPlayer", currentData + 1);
        }
        SummaryViewModel.prototype.refresh(SummaryViewModel.prototype.data.get("currentPlayer"));
    }
    SummaryViewModel.prototype.postData = function(){
        dialogs.prompt({
            title: "Save Remotely",
            message: "Enter in your computer's IP",
            okButtonText: "Send",
            cancelButtonText: "Cancel",
            defaultText: SummaryViewModel.prototype.ipAddress
        }).then(function (r) {
            fetch(r.text,{
                method: "POST",
                body: JSON.stringify({data: SummaryViewModel.prototype.players})
            }).then((r)=>{
                console.log(r)
            })
           
        });
    }
    SummaryViewModel.prototype.saveData = function () {
        const documents = fileSystemModule.knownFolders.documents();
        const folder = documents.getFolder("Data");
        var file = folder.getFile("sessionData2.txt");
        file.writeText(JSON.stringify(SummaryViewModel.prototype.players))
            .then((result) => {
                file.readText().then((res) => {
                    console.log(res)
                })
            }).catch((err) => {
                console.log(err);
            });
    }
    SummaryViewModel.prototype.toUserForm = function (args) {
        const button = args.object;
        const page = button.page;

        var navigationEntry = {
            moduleName: "page_userform/userform-page",
            context: {
                playerList: []
            }
        }
        page.frame.navigate(navigationEntry);
    }
    return SummaryViewModel;
})(observable.Observable);

exports.summaryViewModel = SummaryViewModel;