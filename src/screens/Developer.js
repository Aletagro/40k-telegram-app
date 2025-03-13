import React from 'react';

const tg = window.Telegram.WebApp

const Developer = () => {

    return <div>
        <p>test</p>
        <p>initData: {tg.initData}</p>
        <p>initDataUnsafe: {JSON.stringify(tg.initDataUnsafe)}</p>
        <p>platform: {tg.platform}</p>
        <p>version: {tg.version}</p>
        <p>viewportHeight: {tg.viewportHeight}</p>
    </div>
}

export default Developer