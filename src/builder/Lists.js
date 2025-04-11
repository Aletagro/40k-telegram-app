import React from 'react'
import {useNavigate} from 'react-router-dom'
import {navigationState, roster} from '../utilities/appState'
import Add from '../icons/add.svg'

import find from 'lodash/find'

import Styles from './styles/Lists.module.css'

const dataBase = require('../dataBase.json')

// const lists = [
//     {
//         id: 1,
//         name: 'Крулы из болота молодцы, победили огурцы',
//         factionId: '21ed7371-d9e3-4a05-8b2c-db46cee7d29d'
//     },
//     {
//         id: 2,
//         name: 'Костетрясы',
//         factionId: '262eabc2-f3b4-4296-9ef5-632d6cf1aadf'
//     },
//     {
//         id: 3,
//         name: 'Джовсы',
//         factionId: '298391fb-3d74-4a26-b9cc-5f3ad5fe4852'
//     },
//     {
//         id: 4,
//         name: 'Полотенца',
//         factionId: '0e399a0d-a181-4870-960d-f3709686af0d'
//     },
//     {
//         id: 5,
//         name: 'Мамонты',
//         factionId: '08135df6-633c-4d58-9adb-7d4b8563b0da'
//     },
//     {
//         id: 6,
//         name: 'Крысы',
//         factionId: '7287a920-61ef-41e1-87b9-911319cfe865'
//     },
//     {
//         id: 7,
//         name: 'Тзинч',
//         factionId: 'fc32e7a5-c952-430a-bcda-9aba4195c181'
//     },
//     {
//         id: 8,
//         name: 'Труг всем друг',
//         factionId: '69149f93-d1b0-4b7e-826c-c0308a96b538'
//     }
// ]

const lists = [
    {
        'name': 'Костетрясы',
        'isPublic': true,
        "grandAlliance": "Destruction",
        "faction": "Bonesplitterz",
        "factionId": "262eabc2-f3b4-4296-9ef5-632d6cf1aadf",
        "regiments": [
            {
                "units": [
                    {
                        "id": "071faeda-0ed0-49ad-9035-2b8a09e3eaba",
                        "name": "Kragnos, the End of Empires",
                        "points": 580
                    },
                    {
                        "id": "ea71892b-edd0-4043-9a45-bf54d2ddc54a",
                        "name": "Savage Orruk Arrowboys",
                        "points": 140
                    },
                    {
                        "id": "ea71892b-edd0-4043-9a45-bf54d2ddc54a",
                        "name": "Savage Orruk Arrowboys",
                        "points": 280,
                        "isReinforced": true
                    }
                ],
                "heroId": "071faeda-0ed0-49ad-9035-2b8a09e3eaba",
                "points": 1000
            },
            {
                "units": [
                    {
                        "id": "57e6b64e-0208-48b1-ba38-f62a83469c95",
                        "name": "Maniak Weirdnob",
                        "points": 160,
                        "heroicTrait": "'Orrible Leer",
                        "artefact": "Dokk Juice"
                    },
                    {
                        "id": "ea71892b-edd0-4043-9a45-bf54d2ddc54a",
                        "name": "Savage Orruk Arrowboys",
                        "points": 140
                    }
                ],
                "heroId": "57e6b64e-0208-48b1-ba38-f62a83469c95",
                "points": 300,
                "artefact": "",
                "heroicTrait": ""
            }
        ],
        "warlordId": 0,
        "detachment": "Kop Rukk",
        "pointsLimit": "2500",
        "points": {all: 1850},
    },
    {
        'name': 'Гобла',
        'isPublic': true,
        "grandAlliance": "Destruction",
        "faction": "Gloomspite Gitz",
        "regiments": [
            {
                "units": [
                    {
                        "id": "46863aa6-986e-4d1f-bdcb-5b77dbeb7666",
                        "name": "Fungoid Cave-Shaman",
                        "points": 100,
                        "heroicTrait": "The Clammy Hand"
                    },
                    {
                        "id": "62d9f2df-3a0d-4229-8c79-a5a21997045e",
                        "name": "Rabble-Rowza",
                        "points": 120,
                        "artefact": "Backstabber's Blade"
                    },
                    {
                        "id": "2cc47857-ddc8-4464-8410-039e8618cfd7",
                        "name": "Moonclan Shootas",
                        "points": 300,
                        "isReinforced": true
                    },
                    {
                        "id": "2cc47857-ddc8-4464-8410-039e8618cfd7",
                        "name": "Moonclan Shootas",
                        "points": 150,
                        "isReinforced": false
                    }
                ],
                "heroId": "46863aa6-986e-4d1f-bdcb-5b77dbeb7666",
                "points": 670
            }
        ],
        "warlordId": 0,
        "detachment": "Troggherd",
        "pointsLimit": 2000,
        "points": {all: 1150},
        "factionId": "eef8e883-a05c-40f2-8257-912586275561"
    },
    {
        "grandAlliance": "Chaos",
        "faction": "Blades of Khorne",
        "regiments": [
            {
                "units": [
                    {
                        "id": "2c790937-abbf-403b-83c6-fd1b1ce44f25",
                        "name": "Bloodsecrator",
                        "points": 130,
                        "heroicTrait": "Firebrand",
                        "artefact": "Ar'gath, The King of Blades"
                    },
                    {
                        "id": "8a7a8503-a6ac-45c0-8548-d0ca88b8513d",
                        "name": "Blood Warriors",
                        "points": 420,
                        "isReinforced": true
                    },
                    {
                        "id": "8a7a8503-a6ac-45c0-8548-d0ca88b8513d",
                        "name": "Blood Warriors",
                        "points": 210
                    }
                ],
                "heroId": "2c790937-abbf-403b-83c6-fd1b1ce44f25",
                "points": 760
            },
            {
                "units": [
                    {
                        "id": "031c327d-4a25-4af3-8c0b-58abb282cb4f",
                        "name": "Slaughterpriest",
                        "points": 160
                    },
                    {
                        "id": "41d7e986-8d17-4428-bce5-629233682c85",
                        "name": "Wrathmongers",
                        "points": 120
                    },
                    {
                        "id": "41d7e986-8d17-4428-bce5-629233682c85",
                        "name": "Wrathmongers",
                        "points": 120
                    }
                ],
                "heroId": "031c327d-4a25-4af3-8c0b-58abb282cb4f",
                "points": 400,
                "artefact": "",
                "heroicTrait": ""
            }
        ],
        "warlordId": 0,
        "detachment": "Bloodbound Warhorde",
        "pointsLimit": 2000,
        "points": {all: 1410},
        "factionId": "cc154b45-7b22-45fc-b584-9b3db739070c",
        "name": "test name",
        "isPublic": true
    }
]

const Lists = () => {
    const navigate = useNavigate()

    const handleAddNewRoster = () => {
        navigate('/chooseGrandFaction')
    }

    const handleNavigateToRoster = (list) => () => {
        roster.faction = list.faction
        roster.factionId = list.factionId
        roster.detachment = list.detachment
        roster.warlordId = list.warlordId
        roster.grandFaction = list.grandFaction
        roster.points = list.points
        roster.pointsLimit = list.pointsLimit
        roster.units = list.units
        navigationState.isBuilder = true
        navigate('/builder', {state: {factionId: list.factionId}})
    }

    const renderList = (list) => {
        const army = find(dataBase.data.faction_keyword, ['id', list.factionId])
        return <button id={Styles.button} onClick={handleNavigateToRoster(list)} key={list.id}>
            <img src={army?.moreInfoImage} alt={army?.name} id={Styles.image} />
            <div id={Styles.textContainer}>
                <p id={Styles.text}>{list.name}</p>
                <p id={Styles.text}>{army?.name}</p>
            </div>
        </button>
    }

    return  <div id='column' className='Chapter'>
        <button id={Styles.newRosterButton} onClick={handleAddNewRoster}>
            <p>New Roster</p>
            <img src={Add} alt='' />
        </button>
        {lists.length >= 3
            ? <p id={Styles.notice}>You are using the free version of app.  You can only save 3 army rosters.</p>
            : null
        }
        <div id={Styles.buttonContainer}>
            {lists.map(renderList)}
        </div>
    </div>
}

export default Lists
