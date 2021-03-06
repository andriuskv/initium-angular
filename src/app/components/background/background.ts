import { Component, ElementRef } from "@angular/core";
import { SettingService } from "../../services/settingService";
import { BackgroundService } from "../../services/backgroundService";

@Component({
  selector: "background",
  styles: [`
    :host {
      z-indeX: -1;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      filter: brightness(90%);
    }
  `],
  template: ""
})
export class Background {
  constructor(
    private settingService: SettingService,
    private backgroundService: BackgroundService,
    private elRef: ElementRef
  ) {}

    ngOnInit() {
      this.setBackground(this.settingService.getSetting("background"));
      this.settingService.subscribeToSettingChanges(({ background }) => {
        if (background) {
          this.setBackground(background);
        }
      });
    }

    async setBackground(background) {
      if (background.type === "blob") {
        const image = await this.backgroundService.getIDBBackground(background.id);
        background.url = URL.createObjectURL(image);

        this.setBackgroundStyle(background);
        this.backgroundService.resetBackgroundInfo();
      }
      else if (background.type === "url" || background.url) {
        this.setBackgroundStyle(background);
        this.backgroundService.resetBackgroundInfo();
        this.backgroundService.resetIDBStore();
      }
      else if (background.type === "position") {
        this.elRef.nativeElement.style.backgroundPosition = `${background.x}% ${background.y}%`;
        this.backgroundService.updateDownscaledBackgroundPosition(background.x, background.y);
      }
      else {
        const info = await this.backgroundService.fetchBackgroundInfo();

        if (info) {
          this.setBackgroundStyle({ url: info.url, downscale: false });
          this.backgroundService.resetIDBStore();
          this.settingService.resetSetting("background");
        }
      }
    }

    async setBackgroundStyle({ url, x = 50, y = 50, id = url, downscale = true }) {
      const image = await this.backgroundService.preloadBackground(url);
      const element = this.elRef.nativeElement;

      element.style.backgroundPosition = `${x}% ${y}%`;
      element.style.backgroundImage = `url(${url})`;

      if (downscale) {
        this.backgroundService.createDownscaledBackground({ id, image, x, y });
      }
      setTimeout(() => {
        document.getElementById("downscaled-background")?.remove();
      }, 1000);
    }
}
