namespace KIP {

	export function cloneRect (rect: IBasicRect): IBasicRect {
		let out: IBasicRect = {
			x: rect.x,
			y: rect.y,
			w: rect.w,
			h: rect.h
		};
		return out;
	}

	export function clonePoint (point: IPoint): IPoint {
		let out: IPoint = {
			x: point.x,
			y: point.y
		};
		return out;
	}

	export function clonePointArray (points: IPoint[]): IPoint[] {
		let out: IPoint[] = [];

		let pt: IPoint;
		for (pt of points) {
			let clone: IPoint = clonePoint(pt);
			out.push(clone);
		}

		return out;
	}

	/**
	 * cloneObject
	 * ----------------------------------------------------------------------------
	 * Generic function to try to clone any object, using JSON stringify + parse
	 * @param 	obj		The object to clone
	 * 
	 * @returns	The cloned elements
	 */
	export function cloneObject<T> (obj: T): T {
		return JSON.parse(JSON.stringify(obj));
	} 
}