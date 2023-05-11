import ky from 'ky-universal';
import { KyInstance } from 'ky/distribution/types/ky';
import { KyHeadersInit, Options } from 'ky/distribution/types/options';
import { useAppStore } from './zustand/app-store';

function endpoint() {
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}/nest`;
    } else {
        return 'http://backend:3333/nest';
    }
}

export const getKyInstance = (headers?: KyHeadersInit) => {
    const opts: Options = {
        prefixUrl: endpoint(),
        credentials: 'include',
        headers: headers || {},
    };

    let instance: KyInstance;

    if (typeof window === 'undefined') {
        instance = ky.create(opts);
    } else {
        instance = ky.create({
            ...opts,
            hooks: {
                beforeError: [
                    error => {
                        const { setLoading } = useAppStore.getState();
                        setLoading(false);
                        return error;
                    }
                ]
            }
        });
    }


    return instance;
};