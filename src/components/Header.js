import {t} from '../utilities/i18n'
import React from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {search, lists, navigationState, isCollapseUnitsTypes} from '../utilities/appState'
import Constants from '../Constants'
import {isVkMobile} from '../utilities/platform'
import {resetRoster} from '../utilities/rosterModel'
import Search from '../icons/search.svg'
import ArrowBack from '../icons/arrowBack.svg'
import Export from '../icons/export.svg'
import Home from '../icons/home.svg'

import forEach from 'lodash/forEach'

import Styles from './styles/Header.module.css'

const Header = () => {
    const navigate = useNavigate()
    const {pathname, state} = useLocation()

    const clearCollapseUnitsType = (_, key) => {
        isCollapseUnitsTypes[key] = false
    }

    const clearAppState = () => {
        if (pathname === '/builder') {
            resetRoster()
            navigationState.isBuilder = false
        } else if (pathname === '/search') {
            search.value = ''
            search.Datasheets = []
            search.Rules = []
        } else if (pathname === '/units') {
            forEach(Constants.defaultIsCollapseUnitsTypes, clearCollapseUnitsType)
        } else if (pathname === '/lists') {
            lists.data = []
            lists.meta = {}
            lists.isFirstReq = true
            lists.filters = {all: true, points_limit: 2000}
        }
    }

    const handleGoBack = () => {
        navigate(-1)
        clearAppState()
    }

    const handleNavigateToSearch = () => {navigate('search')}

    const handleNavigateToExport = () => {navigate('export', {state: {title: t('Export List')}})}

    const handleNavigateToHome = () => {
        navigate('/')
        clearAppState()
    }

    const renderRightButton = () => {
        switch (pathname) {
            case '/search':
                return null
            case '/builder':
                return <button id={Styles.rightButton} onClick={handleNavigateToExport}><img src={Export} alt='' /></button>
            default:
                return <div id={Styles.rightButtons}>
                    <button id={Styles.rightButton} onClick={handleNavigateToSearch}><img src={Search} alt='' /></button>
                    {pathname === '/' || pathname === '/export' || navigationState.isBuilder
                        ? null
                        : <button id={Styles.rightButton} onClick={handleNavigateToHome}><img src={Home} alt='' /></button>
                    }
                </div>
        }
    }

    return <div id={Styles.header} className={isVkMobile ? Styles.vkMobile : undefined}>
        {pathname === '/'
            ? null
            : <button id={Styles.leftButton} onClick={handleGoBack}><img src={ArrowBack} alt='' /></button>
        }
        <p id={Styles.title}>{state?.title || 'Warhammer 40K'}</p>
        {renderRightButton()}
    </div>
}

export default Header