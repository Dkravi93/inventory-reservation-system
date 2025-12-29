import { Controller, Post } from "@nestjs/common";

@Controller("inventory/webhook")
export class InventoryWebhookController {
  @Post()
  handle() { return { received: true }; }
}
