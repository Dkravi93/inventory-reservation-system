import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(500).json({ error: "Internal" });
  }
}
