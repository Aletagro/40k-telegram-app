import {useEffect} from 'react'
import {Route, Routes} from 'react-router-dom'
import Main from './screens/Main'
import MainRules from './screens/MainRules'
import Catalog from './screens/Catalog'
import Army from './screens/Army'
import Units from './screens/Units'
import Warscroll from './screens/Warscroll'
import ArmyInfo from './screens/ArmyInfo'
import RegimentsOfRenownList from './screens/RegimentsOfRenownList'
import RegimentOfRenown from './screens/RegimentOfRenown'
import Search from './screens/Search'
import CoreDocuments from './screens/CoreDocuments'
import RuleSections from './screens/RuleSections'
import RuleChapters from './screens/RuleChapters'
import Manifestations from './screens/Manifestations'
import Rules from './screens/Rules'
import Battleplan from './screens/Battleplan'
import Legends from './screens/Legends'
import LegendUnits from './screens/LegendUnits'
import Header from './components/Header'
import Lists from './builder/Lists'
import ChooseGrandAlliance from './builder/ChooseGrandAlliance'
import ChooseFaction from './builder/ChooseFaction'
import Builder from './builder/Builder'
import AddUnit from './builder/AddUnit'
import ChooseEnhancement from './builder/ChooseEnhancement'
import ChooseOption from './builder/ChooseOption'
import ChooseWeapon from './builder/ChooseWeapon'
import Export from './builder/Export'
import Calculator from './calculator/Calculator'
import SinglePlayer from './singlePlayer/SinglePlayer'
import ChooseBattleplan from './singlePlayer/ChooseBattleplan'
import ChooseTactics from './singlePlayer/ChooseTactics'
import Developer from './screens/Developer'

import './App.css'

const tg = window.Telegram.WebApp

function App() {
  useEffect(() => {
    tg.ready()
    if (!tg.isExpanded) {
      tg.expand()
    }
    if (!tg.isClosingConfirmationEnabled) {
      tg.enableClosingConfirmation()
    }
  }, [])

  return <div>
    <Header />
    <Routes>
      <Route index element={<Main />} />
      <Route path={'mainRules'} element={<MainRules />} />
      <Route path={'catalog'} element={<Catalog />} />
      <Route path={'army'} element={<Army />} />
      <Route path={'armyOfRenown'} element={<Army />} />
      <Route path={'units'} element={<Units />} />
      <Route path={'warscroll'} element={<Warscroll />} />
      <Route path={'calculator'} element={<Calculator />} />
      <Route path={'armyInfo'} element={<ArmyInfo />} />
      <Route path={'builder'} element={<Builder />} />
      <Route path={'addUnit'} element={<AddUnit />} />
      <Route path={'regimentOfRenown'} element={<RegimentOfRenown />} />
      <Route path={'regimentOfRenownList'} element={<RegimentsOfRenownList />} />
      <Route path={'chooseEnhancement'} element={<ChooseEnhancement />} />
      <Route path={'chooseOption'} element={<ChooseOption />} />
      <Route path={'chooseWeapon'} element={<ChooseWeapon />} />
      <Route path={'search'} element={<Search />} />
      <Route path={'coreDocuments'} element={<CoreDocuments />} />
      <Route path={'ruleSections'} element={<RuleSections />} />
      <Route path={'ruleChapters'} element={<RuleChapters />} />
      <Route path={'rules'} element={<Rules />} />
      <Route path={'battleplan'} element={<Battleplan />} />
      <Route path={'manifestations'} element={<Manifestations />} />
      <Route path={'legends'} element={<Legends />} />
      <Route path={'legendUnits'} element={<LegendUnits />} />
      <Route path={'lists'} element={<Lists />} />
      <Route path={'chooseGrandAlliance'} element={<ChooseGrandAlliance />} />
      <Route path={'chooseFaction'} element={<ChooseFaction />} />
      <Route path={'export'} element={<Export />} />
      <Route path={'singlePlayer'} element={<SinglePlayer />} />
      <Route path={'chooseTactics'} element={<ChooseTactics />} />
      <Route path={'chooseBattleplan'} element={<ChooseBattleplan />} />
      <Route path={'developer'} element={<Developer />} />
    </Routes>
  </div>
}

export default App;