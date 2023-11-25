import { Model, ModelStatic } from "sequelize";
import { IBaseRepository } from "../IBaseRepository";
import { injectable, unmanaged } from "inversify";
import 'reflect-metadata';

@injectable()
export class BaseRepository<M extends Model> implements IBaseRepository<M> {
    protected _model: ModelStatic<M> ;
	constructor(@unmanaged() model: ModelStatic<M>
    ) {
        this._model = model
    }

	public async all(attributes?: string[]): Promise<M[]> {
		return this._model.findAll({
			attributes,
		});
	}

	public async findById(id: number, attributes?: string[]): Promise<M | null> {
		return await this._model.findByPk(id, {
			attributes,
		});

		
	}

	public async create(data: any): Promise<M> {
		return this._model.create(data);
	}

	public async update(id: number, data: any): Promise<M> {
		const resource = await this.findById(id);

		if (resource) {
			return resource.update(data);
		}

		throw new Error();
	}

	public async delete(id: number): Promise<boolean> {
		const resource = await this.findById(id);

		if (resource) {
			await resource.destroy();
			return true;
		}

		throw new Error();
	}
}

