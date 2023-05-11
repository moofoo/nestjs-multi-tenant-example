import React, { useMemo } from 'react';

import { GetServerSidePropsContext } from 'next';
import { sessionOpts, SessionData } from 'session';
import { getIronSession } from 'iron-session';


import PatientsTable from '../lib/components/patients-table';




export default function Home() {
    return <PatientsTable />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { req, res } = context;

    const session: SessionData = await getIronSession(req, res, sessionOpts);

    const { userName, tenantName } = session;


    return {
        props: { user: { userName, tenantName } }, // will be passed to the page component as props
    };
}
