import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { Layout } from '@/lib/components/layout';
import React from 'react';

import { useShallowEffect } from '@mantine/hooks';
import { useAppStore } from '@/lib/zustand/app-store';
import { usePathname } from 'next/navigation';
import { StoreUser } from '@/lib/types';

export function useStoreUser(props: { user?: StoreUser; }) {
    const { user } = props;

    const pathname = usePathname();

    useShallowEffect(() => {
        if (pathname === '/login') {
            localStorage.removeItem('app-store-storage');
        } else {
            const { setUser, user: storeUser } = useAppStore.getState();
            if (!!user && storeUser?.userName !== user?.userName) {
                setUser(user);
            }
        }
    }, [user, pathname]);

}

export default function App(props: AppProps) {
    const { Component, pageProps } = props;

    const { user } = pageProps;

    const pathname = usePathname();

    useShallowEffect(() => {
        if (pathname === '/login') {
            localStorage.removeItem('app-store-storage');
        } else {
            const { setUser, user: storeUser } = useAppStore.getState();
            if (!!user && storeUser?.userName !== user?.userName) {
                setUser(user);
            }
        }
    }, [user, pathname]);


    return (
        <>
            <Head>
                <title>Multi Tenancy Example App</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>

            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme: 'light',
                }}
            >
                <Layout {...pageProps}><Component {...pageProps} /></Layout>
            </MantineProvider>
        </>
    );
}