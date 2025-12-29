import { Controller, Get } from "@nestjs/common";

@Controller("inventory")
export class InventoryController {
  @Get()
  health() { return { ok: true }; }
}
