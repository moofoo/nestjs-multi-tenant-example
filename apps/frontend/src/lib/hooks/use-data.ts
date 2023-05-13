import React from 'react';
import { getFetchInstance } from '../ofetch-instance';

type MapFn<A> = (value: A, index: number, array: A[]) => A;

export function useData<T>(path: string, mapFn?: MapFn<T>): Partial<T>[] {

    const [oFetch] = React.useState(() => getFetchInstance());

    const [theData, setData] = React.useState<T[]>([{} as T]);

    React.useEffect(() => {
        (async () => {
            const data: T[] = await oFetch(path);

            if (Array.isArray(data)) {
                if (mapFn) {
                    setData(data.map(mapFn));
                } else {
                    setData(data);
                }
            }
        })();
    }, []);

    return theData;
}

