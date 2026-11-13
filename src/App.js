import {useEffect} from 'react'
import {Route, Routes} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {main} from './utilities/appState'
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
import Rules from './screens/Rules'
import Header from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import useSwipeBack from './utilities/useSwipeBack'
import {fetchUser} from './utilities/api'
import UserLists from './builder/UserLists'
import ChooseGrandFaction from './builder/ChooseGrandFaction'
import ChooseFaction from './builder/ChooseFaction'
import Builder from './builder/Builder'
import ViewRoster from './builder/ViewRoster'
import AddUnit from './builder/AddUnit'
import ChooseDetachment from './builder/ChooseDetachment'
import ChooseEnhancement from './builder/ChooseEnhancement'
import ChooseForceDisposition from './builder/ChooseForceDisposition'
import ForceDispositionInfo from './builder/ForceDispositionInfo'
import ChooseUnitAllegiance from './builder/ChooseUnitAllegiance'
import ChooseWargear from './builder/ChooseWargear'
import ChooseAttach from './builder/ChooseAttach'
import Export from './builder/Export'
import Calculator from './calculator/Calculator'
import Developer from './screens/Developer'
import Registration from './screens/Registration'
import LinkAccounts from './screens/LinkAccounts'
import PasteList from './builder/PasteList'
import CommunityLists from './builder/CommunityLists'
import CombatPatrol from './combatPatrol/CombatPatrol'
import CombatPatrolArmies from './combatPatrol/CombatPatrolArmies'
import CombatPatrolArmy from './combatPatrol/CombatPatrolArmy'
import Dashboard from './dashboard/Dashboard'
import GameHistory from './dashboard/GameHistory'
import GameArmies from './dashboard/GameArmies'
import GameChooseArmy from './dashboard/GameChooseArmy'
import GameMission from './dashboard/GameMission'
import GameChooseMission from './dashboard/GameChooseMission'
import GameChooseDetachments from './dashboard/GameChooseDetachments'
import GameBattlefield from './dashboard/GameBattlefield'
import Game from './dashboard/Game'

import './App.css'

// Вне Telegram (например, в браузере) window.Telegram может отсутствовать
const tg = window.Telegram?.WebApp
main.tgId = tg?.initDataUnsafe?.user?.id
// В VK приложение открывается со своими параметрами в адресе
main.vkId = new URLSearchParams(window.location.href.split('?')[1]).get('vk_user_id') || undefined
// Для локальных тестов: id из .env.development.local (в git не попадает) подставляется только при npm start.
// В боевую сборку (npm run build / deploy) этот блок не попадает, поэтому запушить его по ошибке нельзя
if (process.env.NODE_ENV === 'development') {
  if (process.env.REACT_APP_DEV_TG_ID) main.tgId = Number(process.env.REACT_APP_DEV_TG_ID)
  if (process.env.REACT_APP_DEV_VK_ID) main.vkId = process.env.REACT_APP_DEV_VK_ID
}

function App() {
  useSwipeBack()


  useEffect(() => {
    // Пользователь с бэкенда (если уже есть) нужен для сохранения списков
    if ((main.tgId || main.vkId) && !main.user) {
      fetchUser().then(data => {
        if (data?.exists) main.user = data.user
      })
    }
    if (!tg) {
      return
    }
    tg.ready()
    if (!tg.isExpanded) {
      tg.expand()
    }
    if (!tg.isClosingConfirmationEnabled) {
      tg.enableClosingConfirmation()
    }
  }, [])

  return <div>
    <ScrollToTop />
    <Header />
    <ToastContainer />
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
      <Route path={'viewRoster'} element={<ViewRoster />} />
      <Route path={'addUnit'} element={<AddUnit />} />
      <Route path={'chooseDetachment'} element={<ChooseDetachment />} />
      <Route path={'chooseEnhancement'} element={<ChooseEnhancement />} />
      <Route path={'chooseForceDisposition'} element={<ChooseForceDisposition />} />
      <Route path={'chooseUnitAllegiance'} element={<ChooseUnitAllegiance />} />
      <Route path={'forceDispositionInfo'} element={<ForceDispositionInfo />} />
      <Route path={'chooseWargear'} element={<ChooseWargear />} />
      <Route path={'chooseAttach'} element={<ChooseAttach />} />
      <Route path={'search'} element={<Search />} />
      <Route path={'coreRules'} element={<CoreRules />} />
      <Route path={'keyDocuments'} element={<KeyDocuments />} />
      <Route path={'ruleSections'} element={<RuleSections />} />
      <Route path={'rules'} element={<Rules />} />
      <Route path={'dashboard'} element={<Dashboard />} />
      <Route path={'gameHistory'} element={<GameHistory />} />
      <Route path={'gameArmies'} element={<GameArmies />} />
      <Route path={'gameChooseArmy'} element={<GameChooseArmy />} />
      <Route path={'gameMission'} element={<GameMission />} />
      <Route path={'gameChooseMission'} element={<GameChooseMission />} />
      <Route path={'gameChooseDetachments'} element={<GameChooseDetachments />} />
      <Route path={'gameBattlefield'} element={<GameBattlefield />} />
      <Route path={'game'} element={<Game />} />
      <Route path={'userLists'} element={<UserLists />} />
      <Route path={'chooseGrandFaction'} element={<ChooseGrandFaction />} />
      <Route path={'chooseFaction'} element={<ChooseFaction />} />
      <Route path={'export'} element={<Export />} />
      <Route path={'registration'} element={<Registration />} />
      <Route path={'linkAccounts'} element={<LinkAccounts />} />
      <Route path={'pasteList'} element={<PasteList />} />
      <Route path={'lists'} element={<CommunityLists />} />
      <Route path={'combatPatrol'} element={<CombatPatrol />} />
      <Route path={'combatPatrolArmies'} element={<CombatPatrolArmies />} />
      <Route path={'combatPatrolArmy'} element={<CombatPatrolArmy />} />
      <Route path={'developer'} element={<Developer />} />
    </Routes>
  </div>
}

export default App;