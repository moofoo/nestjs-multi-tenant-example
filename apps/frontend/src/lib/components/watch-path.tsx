import { usePathname, useSearchParams } from 'next/navigation';
import { useDidUpdate } from '@mantine/hooks';
import { useAppStore } from '../zustand/app-store';

export function WatchPathChange() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useDidUpdate(() => {
        setTimeout(() => {
            const { setLoading } = useAppStore.getState();
            setLoading(false);
        });

    }, [pathname, searchParams]);

    return null;
}
