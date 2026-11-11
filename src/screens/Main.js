import {t} from '../utilities/i18n'
import React from 'react'
import Tile from '../components/Tile'
import HeaderImage from '../components/HeaderImage'
import SupportCard from '../components/SupportCard'
import LanguageSelect from '../components/LanguageSelect'
import {canLinkAccounts} from '../utilities/linkAccounts'
import spaceMarine from '../images/spaceMarine.jpeg'

import Styles from './styles/Main.module.css'

const {metadata} = require('../utilities/db')

const Main = () => {
    return <>
        <div className={Styles.hero}>
            <HeaderImage src={spaceMarine} alt='main' />
            <div className={Styles.heroShade} />
        </div>
        <div className={Styles.menu}>
            <Tile featured title={t('Builder')} text={t('Build and save your army lists')} navigateTo='userLists' />
            <div className={Styles.grid}>
                <Tile compact title={t('Rules')} text={t('Armies and core rules')} navigateTo='mainRules' />
                <Tile compact title={t('Community Lists')} text={t('Lists from other players')} navigateTo='lists' />
                <Tile compact wide={!canLinkAccounts()} title={t('Combat Patrol')} text={t('Ready-made boxed armies')} navigateTo='combatPatrol' />
                {canLinkAccounts() ? <Tile compact title={t('Link Accounts')} text={t('Telegram and VK in one account')} navigateTo='linkAccounts' /> : null}
                {/* <Tile compact title='Damage Calculator' text='Averages for any attack' navigateTo='calculator' /> */}
            </div>
            <LanguageSelect />
            <SupportCard />
            <p className={Styles.footer}>{t('For feedback -')} <b>@RukosuevKrasavchik</b></p>
            <p className={Styles.footer}>Database version {metadata?.data_version}</p>
        </div>
    </>
}

export default Main
