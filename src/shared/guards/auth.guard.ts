import { Injectable, CanActivate } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate() { return true; }
}
