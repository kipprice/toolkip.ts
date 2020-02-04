namespace KIP {
    export interface BoundEvalFunction<T> {
		(): T
	}

	export interface BoundUpdateFunction<T> {
		(newVal: T): void;
	}

	export interface BoundDeleteFunction {
		(): boolean;
	}

	export interface IBindingDetails<T> {
		id: string;
		eval: BoundEvalFunction<T>;
		update: BoundUpdateFunction<T>;
		delete: BoundDeleteFunction;
		lastValue: T;
		equals: EqualityFunction<T>;
	}
}