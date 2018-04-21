import { Component, Output, EventEmitter } from "@angular/core";
import { ZIndexService } from "../../services/zIndexService";

@Component({
    selector: "widget-menu",
    templateUrl: "./widget-menu.html"
})
export class WidgetMenu {
    @Output() toggle = new EventEmitter();

    visible: boolean = false;
    isClosing: boolean = false;
    reminderInicatorVisible: boolean = false;
    selectedItem: string = "";
    zIndex: number = 0;

    constructor(private zIndexService: ZIndexService) {
        this.zIndexService = zIndexService;
    }

    ngOnInit() {
        window.addEventListener("dropbox", (event: CustomEvent) => {
            if (event.detail.loggedIn) {
                this.toggleItem("dropbox");
            }
            else {
                this.toggleItem("settings");
            }
        });
    }

    toggleUpperBlock() {
        this.toggle.emit("upper");
    }

    toggleMenu() {
        this.visible = !this.visible;
    }

    toggleItem(item) {
        this.selectedItem = item;
        this.increaseZIndex();
    }

    closeSelectedItem() {
        if (this.selectedItem === "dropbox") {
            this.toggleItem("settings");
            return;
        }
        this.isClosing = true;

        setTimeout(() => {
            this.selectedItem = "";
            this.isClosing = false;
        }, 500);
    }

    increaseZIndex() {
        this.zIndex = this.zIndexService.incIfLess(this.zIndex);
    }

    showReminderIndicator(visible) {
        this.reminderInicatorVisible = visible;
    }
}
