// see: https://github.com/mantinedev/mantine/issues/2815#issuecomment-1435702285

'use client';
import { useGluedEmotionCache } from './glue';
import { CacheProvider } from '@emotion/react';
import { MantineProvider } from '@mantine/core';

export default function EmotionProvider({ children }: { children: JSX.Element; }) {
    const cache = useGluedEmotionCache();
    return (
        <CacheProvider value={cache}>
            <MantineProvider withGlobalStyles withNormalizeCSS emotionCache={cache}>
                {children}
            </MantineProvider>
        </CacheProvider>
    );
}