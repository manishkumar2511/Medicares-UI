import { inject, Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private messageService = inject(MessageService);

  success(summary: string, detail?: string) {
    this.messageService.add({ severity: "success", summary, detail });
  }

  error(summary: string = "Error!", detail: string = "Something went wrong!") {
    this.messageService.add({ severity: "error", summary, detail });
  }

  info(summary: string, detail?: string) {
    this.messageService.add({ severity: "info", summary, detail });
  }

  warn(summary: string, detail?: string) {
    this.messageService.add({ severity: "warn", summary, detail });
  }

  clear() {
    this.messageService.clear();
  }
}