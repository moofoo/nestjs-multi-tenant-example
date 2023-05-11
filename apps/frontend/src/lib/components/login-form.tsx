'use client';

import React from 'react';

import {
    Paper,
    Group,
    Button,
    Stack,
    Center,
    Title,
    Box,
} from '@mantine/core';

import { useForm } from "react-hook-form";

import {
    PasswordInput,
    TextInput,
} from "react-hook-form-mantine";
import { getKyInstance } from '../ky-instance';
import { useAppStore } from '../zustand/app-store';
import { useRouter } from 'next/navigation';
function getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}


/*
post(url: string, data?: any, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<any, any>>
*/

export function LoginForm() {

    const { control, handleSubmit } = useForm({
        defaultValues: {
            userName: '',
            password: ''
        }
    });

    //const [ky] = React.useState(() => getKyInstance());

    const router = useRouter();


    const onSubmitOk = async (data: { userName: string, password: string; }) => {
        const { setLoading } = useAppStore.getState();
        setLoading(true);
        const ky = getKyInstance();

        const result = await ky.post('auth/login', { json: data });

        if ([200, 201].includes(result.status)) {
            router.push('/');
        } else {
            throw new Error(`Something went wrong: ${result.status} / ${result.statusText}`);
        }

    };

    return (
        <Center maw={400} pt={25} mx="auto">
            <Stack>
                <Paper radius="md" p="xl" withBorder shadow='md'>
                    <form
                        onSubmit={handleSubmit(
                            (data) => onSubmitOk(data)
                        )}
                    >
                        <Stack>
                            <TextInput required name="userName" control={control} label="Username" radius="md" />
                            <PasswordInput
                                name="password"
                                control={control}
                                label="Password"
                                required
                                placeholder="Your password"
                                radius="md"
                            />
                        </Stack>

                        <Group position="right" mt="xl">
                            <Button type="submit" radius="xl">
                                Login
                            </Button>
                        </Group>
                    </form>
                </Paper>

                <Stack ml={40}>

                    <Group><Title order={6}>Tenant 1 - user1:user1</Title> </Group>
                    <Group><Title order={6}>Tenant 2 - user2:user2</Title> </Group>
                    <Group><Title order={6}>Admin Tenant - admin:admin</Title> </Group>
                </Stack>

            </Stack>
        </Center>
    );
}
