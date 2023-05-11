import React from 'react';
import { getKyInstance } from '@/lib/ky-instance';

type MapFn<A> = (value: A, index: number, array: A[]) => A;

export function useData<T>(path: string, mapFn?: MapFn<T>): Partial<T>[] {

    const [ky] = React.useState(() => getKyInstance());

    const [theData, setData] = React.useState<T[]>([{} as T]);

    React.useEffect(() => {
        (async () => {
            const data: T[] = await ky.get(path).json();

            if (Array.isArray(data)) {
                if (mapFn) {
                    setData(data.map<T>(mapFn));
                } else {
                    setData(data);
                }
            }
        })();
    }, []);

    return theData;
}

