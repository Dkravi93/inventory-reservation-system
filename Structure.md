src/
 ├── modules/
 │    ├── inventory/
 │    │    ├── controllers/
 │    │    │    ├── inventory.controller.ts
 │    │    │    └── inventory-webhook.controller.ts
 │    │    ├── services/
 │    │    │    ├── inventory.service.ts
 │    │    │    └── inventory-cache.service.ts
 │    │    ├── repositories/
 │    │    │    └── inventory.repository.ts
 │    │    ├── entities/
 │    │    │    └── inventory.entity.ts
 │    │    ├── dto/
 │    │    │    ├── create-inventory.dto.ts
 │    │    │    ├── update-inventory.dto.ts
 │    │    │    └── inventory-response.dto.ts
 │    │    ├── interfaces/
 │    │    ├── constants/
 │    │    ├── decorators/
 │    │    ├── strategies/
 │    │    ├── inventory.module.ts
 │    │    └── inventory.providers.ts
 │    ├── reservation/
 │    ├── order/
 │    ├── payment/
 │    │    ├── gateways/
 │    │    │    └── payu.gateway.ts
 │    │    └── strategies/
 │
 ├── infra/
 │    ├── database/
 │    │    ├── typeorm/
 │    │    │    └── migrations/
 │    │    └── seeders/
 │    ├── redis/
 │    │    ├── redis.module.ts
 │    │    └── redis.service.ts
 │    ├── queues/
 │    │    ├── bull.module.ts
 │    │    ├── processors/
 │    │    └── producers/
 │    ├── cache/
 │    └── health/
 │
 ├── shared/
 │    ├── exceptions/
 │    │    └── http-exception.filter.ts
 │    ├── guards/
 │    │    ├── auth.guard.ts
 │    │    └── roles.guard.ts
 │    ├── interceptors/
 │    │    ├── transform.interceptor.ts
 │    │    └── cache.interceptor.ts
 │    ├── decorators/
 │    ├── middleware/
 │    ├── utils/
 │    └── constants/
 │
 ├── config/
 │    ├── configuration.ts
 │    ├── database.config.ts
 │    ├── redis.config.ts
 │    ├── payu.config.ts
 │    └── validation-schema.ts
 │
 ├── core/
 │    ├── base/
 │    ├── interfaces/
 │    └── abstract-repository.ts
 │
 ├── app.module.ts
 └── main.ts
