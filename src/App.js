import {useEffect} from 'react'
import {Route, Routes} from 'react-router-dom'
import Main from './screens/Main'
import MainRules from './screens/MainRules'
import Armies from './screens/Armies'
import Army from './screens/Army'
import Units from './screens/Units'
import Datasheet from './screens/Datasheet'
import ArmyRules from './screens/ArmyRules'
import Detachment from './screens/Detachment'
import Enhancements from './screens/Enhancements'
import Stratagems from './screens/Stratagems'
import FAQ from './screens/FAQ'
import Errata from './screens/Errata'
import Search from './screens/Search'
import CoreRules from './screens/CoreRules'
import KeyDocuments from './screens/KeyDocuments'
import RuleSections from './screens/RuleSections'
import RuleChapters from './screens/RuleChapters'
import Rules from './screens/Rules'
import Battleplan from './screens/Battleplan'
import Header from './components/Header'
import Lists from './builder/Lists'
import ChooseGrandFaction from './builder/ChooseGrandFaction'
import ChooseFaction from './builder/ChooseFaction'
import Builder from './builder/Builder'
import AddUnit from './builder/AddUnit'
import ChooseDetachment from './builder/ChooseDetachment'
import ChooseEnhancement from './builder/ChooseEnhancement'
import ChooseOption from './builder/ChooseOption'
import ChooseWargear from './builder/ChooseWargear'
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
      <Route path={'armies'} element={<Armies />} />
      <Route path={'army'} element={<Army />} />
      <Route path={'armyOfRenown'} element={<Army />} />
      <Route path={'units'} element={<Units />} />
      <Route path={'datasheet'} element={<Datasheet />} />
      <Route path={'calculator'} element={<Calculator />} />
      <Route path={'armyRules'} element={<ArmyRules />} />
      <Route path={'detachment'} element={<Detachment />} />
      <Route path={'enhancements'} element={<Enhancements />} />
      <Route path={'stratagems'} element={<Stratagems />} />
      <Route path={'faq'} element={<FAQ />} />
      <Route path={'errata'} element={<Errata />} />
      <Route path={'builder'} element={<Builder />} />
      <Route path={'addUnit'} element={<AddUnit />} />
      <Route path={'chooseDetachment'} element={<ChooseDetachment />} />
      <Route path={'chooseEnhancement'} element={<ChooseEnhancement />} />
      <Route path={'chooseOption'} element={<ChooseOption />} />
      <Route path={'chooseWargear'} element={<ChooseWargear />} />
      <Route path={'search'} element={<Search />} />
      <Route path={'coreRules'} element={<CoreRules />} />
      <Route path={'keyDocuments'} element={<KeyDocuments />} />
      <Route path={'ruleSections'} element={<RuleSections />} />
      <Route path={'ruleChapters'} element={<RuleChapters />} />
      <Route path={'rules'} element={<Rules />} />
      <Route path={'battleplan'} element={<Battleplan />} />
      <Route path={'lists'} element={<Lists />} />
      <Route path={'chooseGrandFaction'} element={<ChooseGrandFaction />} />
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