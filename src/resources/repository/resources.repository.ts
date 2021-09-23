import { EntityRepository, Repository } from 'typeorm';
import { Resource } from '../entity/resource.entity';

@EntityRepository(Resource)
export class ResourcesRepository extends Repository<Resource> {}
