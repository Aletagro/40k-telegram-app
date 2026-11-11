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
            <Tile featured title='Builder' text='Build and save your army lists' navigateTo='userLists' />
            <div className={Styles.grid}>
                <Tile compact title='Rules' text='Armies and core rules' navigateTo='mainRules' />
                <Tile compact title='Community Lists' text='Lists from other players' navigateTo='lists' />
                <Tile compact wide={!canLinkAccounts()} title='Combat Patrol' text='Ready-made boxed armies' navigateTo='combatPatrol' />
                {canLinkAccounts() ? <Tile compact title='Link Accounts' text='Telegram and VK in one account' navigateTo='linkAccounts' /> : null}
                {/* <Tile compact title='Damage Calculator' text='Averages for any attack' navigateTo='calculator' /> */}
            </div>
            <LanguageSelect />
            <SupportCard />
            <p className={Styles.footer}>For feedback - <b>@RukosuevKrasavchik</b></p>
            <p className={Styles.footer}>Database version {metadata?.data_version}</p>
        </div>
    </>
}

export default Main
