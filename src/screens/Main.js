import React from 'react'
import Tile from '../components/Tile'
import HeaderImage from '../components/HeaderImage'
import LanguageSelect from '../components/LanguageSelect'
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
            <Tile featured title='Builder' text='Build your army list' navigateTo='chooseGrandFaction' />
            <div className={Styles.grid}>
                <Tile compact wide title='Rules' text='Core rules, key documents and armies' navigateTo='mainRules' />
                {/* <Tile compact title='Damage Calculator' text='Averages for any attack' navigateTo='calculator' /> */}
            </div>
            <LanguageSelect />
            <p className={Styles.footer}>Card number for support - 5536 9141 9279 5999 (Rukosuev Nikita)</p>
            <p className={Styles.footer}>For feedback - <b>@RukosuevKrasavchik</b></p>
            <p className={Styles.footer}>Database version {metadata?.data_version}</p>
        </div>
    </>
}

export default Main
