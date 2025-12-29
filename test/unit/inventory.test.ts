import Redis from "ioredis";
import { InventoryRepository } from "src/modules/inventory/repositories/inventory.repository";
import { InventoryService } from "src/modules/inventory/services/inventory.service";

// Example unit test
describe('InventoryService', () => {
  let service: InventoryService;
  let repository: InventoryRepository;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryRepository,
          useValue: {
            findBySku: jest.fn(),
            reserveStock: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            setex: jest.fn(),
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repository = module.get<InventoryRepository>(InventoryRepository);
    redisClient = module.get<Redis>('REDIS_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySku', () => {
    it('should return inventory from cache if available', async () => {
      const cachedInventory = JSON.stringify({ sku: 'TEST', quantity: 10 });
      jest.spyOn(redisClient, 'get').mockResolvedValue(cachedInventory);

      const result = await service.findBySku('TEST');

      expect(result).toEqual({ sku: 'TEST', quantity: 10 });
      expect(repository.findBySku).not.toHaveBeenCalled();
    });
  });
});
