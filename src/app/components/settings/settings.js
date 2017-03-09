import { Component, Output, EventEmitter } from "@angular/core";
import { SettingService } from "Services/settingService";

@Component({
    selector: "settings",
    templateUrl: "app/components/settings/settings.html"
})
export class Settings {
    @Output() setting = new EventEmitter();

    active = "general";

    static get parameters() {
        return [[SettingService]];
    }

    constructor(settingService) {
        this.settingService = settingService;
    }

    ngOnInit() {
        this.settings = this.settingService.getSettings();
        this.setting.emit(this.settings);
    }

    setActiveTab(tab) {
        this.active = tab;
    }

    getWeatherWithCityName({ target }) {
        if (target.value !== this.settings.weather.cityName) {
            this.onSetting("cityName", target.value);
        }
    }

    onSetting(settingName, value) {
        const setting = {
            [this.active]: {
                [settingName]: value
            }
        };

        this.setting.emit(setting);

        if (settingName !== "resetMostVisited") {
            this.settings = this.settingService.updateSetting(setting);
        }
    }
}
