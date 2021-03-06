import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { TimeDateService } from "./timeDateService";
import { SettingService } from "./settingService";

@Injectable({ providedIn: "root" })
export class FeedService {
    constructor(
        private domSanitizer: DomSanitizer,
        private timeDateService: TimeDateService,
        private settingService: SettingService
    ) {}

    getFeed(url, title) {
        return this.fetchFeed(url).then(feed => {
            if (feed) {
                if (Array.isArray(feed.items)) {
                    return { url, ...this.parseFeed(feed, title) };
                }
                throw new Error("Feed has no entries");
            }
            throw new Error("Feed was not found");
        });
    }

    getNewEntries(newEntries, entries) {
        return newEntries.reduce((newEntries, entry) => {
            const notDuplicate = !entries.some(({ link, title }) => {
                return link === this.getEntryLink(entry) || title === entry.title.trim();
            });

            if (notDuplicate) {
                newEntries.push(this.parseEntry(entry, true));
            }
            return newEntries;
        }, []);
    }

    updateFeed({ url, entries }) {
        return this.fetchFeed(url).then(feed => {
            if (feed) {
                const data: any = {};
                const updated = this.parseDate(feed.lastBuildDate);

                if (updated) {
                    data.updated = updated;
                }
                return {
                    ...data,
                    entries: this.getNewEntries(feed.items, entries)
                };
            }
        });
    }

    fetchFeed(url) {
        return fetch(`${process.env.SERVER_URL}/feed?url=${url}`)
            .then(response => response.json())
            .then(({ feed }) => feed)
            .catch(error => {
                console.log(error);
            });
    }

    parseFeed(feed, title) {
        const data: any = {};
        const image = feed.image?.url;
        const updated = this.parseDate(feed.lastBuildDate);

        if (image) {
            data.image = image;
        }

        if (updated) {
            data.updated = updated;
        }
        return {
            ...data,
            title: title || feed.title,
            description: feed.description,
            newEntryCount: 0,
            entries: this.parseEntries(feed.items),
        };
    }

    parseEntries(entries) {
        return entries.map(entry => this.parseEntry(entry));
    }

    parseEntry(entry, newEntry = false) {
        const content = entry.content ? entry.content.trim() : "";

        return {
            title: entry.title.trim(),
            link: this.getEntryLink(entry),
            description: this.domSanitizer.bypassSecurityTrustHtml(content),
            date: this.parseDate(entry.pubDate),
            truncated: this.needTruncation(content),
            newEntry
        };
    }

    getEntryLink(entry) {
        if (entry.link) {
            return this.domSanitizer.bypassSecurityTrustUrl(entry.link.trim());
        }
        else if (entry.guid) {
            return entry.guid.trim();
        }
        return this.domSanitizer.bypassSecurityTrustUrl("javascript: void 0;");
    }

    parseDate(dateStr) {
        if (!dateStr) {
            return;
        }
        const date = new Date(dateStr);
        const { format } = this.settingService.getSetting("time");

        return this.timeDateService.getDate("month day, year at hours:minutes period", {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
            hourFormat: format
        });
    }

    needTruncation(content) {
        const div = document.createElement("div");

        div.insertAdjacentHTML("beforeend", content);
        div.classList.add("feed-description");

        // Add width to match original container width.
        div.style.width = "558px";
        document.body.appendChild(div);

        const { offsetHeight } = div;

        div.parentElement.removeChild(div);
        return offsetHeight > 280;
    }
}
