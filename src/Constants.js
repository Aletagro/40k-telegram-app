import {accordionSummaryClasses} from '@mui/joy/AccordionSummary'

const Constants = {
    grandFactions: [
        {
            name: 'Imperium',
            factions: [
                {name: 'Adepta Sororitas', id: 'aee1b46d-3461-4d5d-a612-0efd05dd843d'},
                {name: 'Adeptus Custodes', id: '6cc4ee5e-3bc6-4142-8147-2e1a9fb6e82c'},
                {name: 'Adeptus Mechanicus', id: '60ecf26b-0c2b-4ea3-8a29-5f06bd02f6d8'},
                {name: 'Astra Militarum', id: '9b847488-9663-48dc-b819-08ab93ac4382'},
                {name: 'Grey Knights', id: '93423323-3abb-4a72-a51e-b8ac54f2f98d'},
                {name: 'Imperial Agents', id: '2f81671f-3164-4ab0-93c0-4a99746b5996'},
                {name: 'Imperial Knights', id: '5737b3b6-1c33-4cb3-828c-08b6909197aa'}
            ],
            image: 'https://www.destructoid.com/wp-content/uploads/2024/07/imperium-vs-orks-warhammer-40k.jpg?fit=1200%2C675'
        },
        {
            name: 'Imperium - Adeptus Astartes',
            factions: [
                {name: 'Black Templars', id: '28162de0-fd36-450b-87ee-39e973ead32d'},
                {name: 'Blood Angels', id: '864734c9-d6c7-4486-92de-9b8271a6a1e5'},
                {name: 'Dark Angels', id: 'fa0e86ef-b5da-4510-9a9f-8cd86267bb6a'},
                {name: 'Deathwatch', id: '51ac31b0-93ff-4c94-a9a5-5c1a97fbbb75'},
                {name: 'Imperial Fists', id: 'cd8dd346-3b5a-489d-8e47-22711922098d'},
                {name: 'Iron Hands', id: '780aa838-ed0f-44b7-bca3-ff54d357a07b'},
                {name: 'Raven Guard', id: '8d74ba46-ac06-4c05-a90c-5d25282b2c94'},
                {name: 'Salamanders', id: '4db683fe-87a0-4138-9b53-4b326c8e8521'},
                {name: 'Space Marines', id: '01623188-9470-4441-96b0-e06eb2572bb5'},
                {name: 'Space Wolves', id: 'bc367514-36b7-47c6-bd3f-ffbf85f5cfd9'},
                {name: 'Ultramarines', id: 'b7d67027-cf56-4cd1-8127-9e7658de4ef5'},
                {name: 'White Scars', id: 'a65e110c-2b80-4887-8b2f-1f335b4dd450'}
            ],
            image: 'https://warhammer40kfanatics.com/wp-content/uploads/2024/01/warhammer-40k-miniatures-banner.png'
        },
        {
            name: 'Chaos',
            factions: [
                {name: 'Chaos Daemons', id: '40a70c91-675a-4ac5-aa97-daedb9cb6f11'},
                {name: 'Chaos Knights', id: '2e79f9cd-94dc-48ca-bddf-6d5e877609c5'},
                {name: 'Chaos Space Marines', id: 'd4162ab7-8356-4e4e-adb3-5e3b631d47e6'},
                {name: 'Death Guard', id: '19176137-2faa-4d6e-adb4-2572510032b7'},
                {name: 'Emperor’s Children', id: 'b63a417d-63ea-4d20-b7f0-85c66c56979e'},
                {name: 'Thousand Sons', id: '25d2c58f-59b5-4a4f-b597-495ba322ce07'},
                {name: 'World Eaters', id: '8bd4c67d-4aba-4502-8561-7c6c6faae51d'}
            ],
            image: 'https://warzonestudio.com/image/catalog/blog/Chaos-Daemons-codex-review/Chaos-daemons-codex-review-03.jpg'
        },
        {
            name: 'Xenos',
            factions: [
                {name: 'Aeldari', id: '2cb72f92-bfc7-4d2c-a183-b2bff6b26bfc'},
                {name: 'Drukhari', id: '43bbfe97-4c14-47be-be2b-90de3e6756b1'},
                {name: 'Genestealer Cults', id: '800c0387-5033-47da-bad0-f42e53b37453'},
                {name: 'Leagues of Votann', id: 'a42808ab-f00b-4664-aed5-8d9341b96e36'},
                {name: 'Necrons', id: '47670bc3-64b8-4c2d-9154-7391f132688b'},
                {name: 'Orks', id: '0b30f1e3-1e5c-4823-afa1-07951433a270'},
                {name: 'Tyranids', id: 'b30b3258-9140-46b8-9c9e-113be9008ea9'},
                {name: 'T’au Empire', id: '1a241f8e-2d79-47c4-82b1-f6faea353970'}
            ],
            image: 'https://static1.thegamerimages.com/wordpress/wp-content/uploads/wm/2025/01/tyranid-screamer-killer-4-final.jpg'
        }
    ],
    armyEnhancements: [
        {
            title: 'Battle Traits',
            groupName: 'ability_group',
            ruleName: 'ability',
            ruleIdName: 'abilityGroupId',
            abilityGroupType: 'battleTraits',
            abilityKeywordsName: 'ability_keyword',
            abilityIdName: 'abilityId'
        },
        {
            title: 'Battle Formations',
            groupName: 'battle_formation',
            ruleName: 'battle_formation_rule',
            ruleIdName: 'battleFormationId'
        },
        {
            title: 'Artefacts of Power',
            groupName: 'ability_group',
            ruleName: 'ability',
            ruleIdName: 'abilityGroupId',
            abilityGroupType: 'artefactsOfPower',
            abilityKeywordsName: 'ability_keyword',
            abilityIdName: 'abilityId'
        },
        {
            title: 'Heroic Traits',
            groupName: 'ability_group',
            ruleName: 'ability',
            ruleIdName: 'abilityGroupId',
            abilityGroupType: 'heroicTraits',
            abilityKeywordsName: 'ability_keyword',
            abilityIdName: 'abilityId'
        },
        {
            title: 'Spell Lores',
            groupName: 'lore',
            ruleName: 'lore_ability',
            ruleIdName: 'loreId',
            abilityGroupType: undefined,
            abilityKeywordsName: 'lore_ability_keyword',
            abilityIdName: 'loreAbilityId',
            includesTexts: ['Lore of', 'Spell Lore', 'Arcane']
        },
        {
            title: 'Prayer Lores',
            groupName: 'lore',
            ruleName: 'lore_ability',
            ruleIdName: 'loreId',
            abilityGroupType: undefined,
            abilityKeywordsName: 'lore_ability_keyword',
            abilityIdName: 'loreAbilityId',
            includesTexts: ['Prayer', 'Bless', 'Rites', 'Warbeats', 'Scriptures']
        }
    ],
    coreRulesId: '1c03d77c-1762-4cf3-bea1-9f4ba5768552',
    coreRulesImage: 'https://d3ocysny7bghv8.cloudfront.net/c1e62db9-036d-49fa-9d4d-6c6395a81d95',
    keyDocumentsId: '085bb508-281f-4a92-a99b-801a5c95c165',
    keyDocumentsImage: 'https://d3ocysny7bghv8.cloudfront.net/9ba4219a-2937-491d-814e-3fbd305c44dc',
    manifestationsPublicationId: '318c212e-cbcd-4b44-a44d-318f3ae180a0',
    regimentsOfRenownImage: 'https://dhss9aar8ocw.cloudfront.net/39478fae-cf03-40ee-a130-6fef03492c44',
    unitsTypes: [
        {
            name: 'Epic Hero'
        },
        {
            name: 'Character'
        },
        {
            name: 'Battleline',
            withoutHero: true
        },
        {
            name: 'Infantry',
            withoutHero: true
        },
        {
            name: 'Mounted',
            withoutHero: true
        },
        {
            name: 'Beasts',
            withoutHero: true
        },
        {
            name: 'Beast',
            withoutHero: true
        },
        {
            name: 'Monster',
            withoutHero: true
        },
        {
            name: 'Vehicle',
            withoutHero: true
        },
        {
            name: 'Dedicated Transport',
            withoutHero: true
        },
        {
            name: 'Artillery',
            withoutHero: true
        },
        {
            name: 'Swarm',
            withoutHero: true
        },
        {
            name: 'Fortification',
            withoutHero: true
        }
    ],
    abilitiesTypes: {
        startOfTurn: 'black',
        combatPhase: 'darkred',
        heroPhase: 'rgb(201 189 82)',
        movementPhase: 'grey',
        defensive: 'darkgreen',
        chargePhase: 'rgb(182, 92, 28)',
        shootingPhase: 'rgb(26, 72, 110)',
        endOfTurn: 'indigo'
    },
    tacticsTypes: {
        UNIVERSAL: 'black',
        CHAOS: 'darkred',
        DESTRUCTION: 'darkgreen',
        ORDER: 'rgb(26, 72, 110)',
        DEATH: 'indigo'
    },
    regimentOfRenownsWithWizard: [
        {
            id: '0d95831a-70f6-4ca0-8fcb-a438740ec203',
            name: "Braggit's Bottle-Snatchaz"
        },
        {
            id: '4eb81bd5-0209-4ea1-9780-c2ee5e6de3a6',
            name: "Brand's Oathbound"
        },
        {
            id: 'e6814e04-a5c0-40eb-9a42-a0b8573b37c0',
            name: "Neferata's Royal Echelon"
        },
        {
            id: '9aaa73cd-7282-4d6e-a33a-96df53de4866',
            name: 'The Blacktalons'
        },
        {
            id: 'af2b3337-b0d5-40f1-849a-f61bc4bafcdf',
            name: 'The Coven of Thryx'
        },
        {
            id: 'd14b3e70-d378-41fb-89e5-c108f735674a',
            name: "The Liche's Hand"
        },
        {
            id: '090e93b1-4d91-44f1-bf57-3d6282ec0e45',
            name: 'The Sorrowmourn Choir'
        },
        {
            id: 'b62bbcf9-d46e-427c-9b3b-c6ee6401705e',
            name: 'The Sternieste Garrison'
        },
        {
            id: 'dc211333-b689-4380-b0b6-eb6add5ac1f2',
            name: "The Summerking's Entourage"
        },
        {
            id: "037eca6d-f114-406d-87bd-8f26087f69bb",
            name: "Enforcers of the Tithe"
        },
        {
            id: "95c48875-b067-4876-b128-515bcf0459dd",
            name: "Goroan Scions"
        }
    ],
    calculatorAbilities: [
        {
            name: 'Crit (2 Hits)',
            type: 'doubleHit'
        },
        {
            name: 'Crit (Auto-wound)',
            type: 'autoWound'
        },
        {
            name: 'Crit (Mortal)',
            type: 'mortal'
        }
    ],
    calculatorCharacteristics: [
        {
            name: 'To Hit',
            type: 'toHit',
            values: [2, 3, 4, 5, 6]
        },
        {
            name: 'To Wound',
            type: 'toWound',
            values: [2, 3, 4, 5, 6]
        },
        {
            name: 'Rend',
            type: 'rend',
            values: [0, 1, 2, 3, 4]
        },
        {
            name: 'Damage',
            type: 'damage',
            values: [1, 2, 3, 4],
            hasCustom: true
        }
    ],
    calculatorInputs: [
        {
            name: 'Models',
            type: 'models'
        },
        {
            name: 'Attacks',
            type: 'attacks'
        }
    ],
    saves: [
        {value: 2, title: '2+'},
        {value: 3, title: '3+'},
        {value: 4, title: '4+'},
        {value: 5, title: '5+'},
        {value: 6, title: '6+'}
    ],
    critOn: [
        {modificator: 3, title: 'Crit on 4+'},
        {modificator: 2, title: 'Crit on 5+'},
        {modificator: 1, title: 'Crit on 6+'}
    ],
    battleplansRuleSectionId: '97befff2-c7fa-4ee2-aa73-1e7fe2e8d8cd',
    tacticsIds: {
        Universal: 'b14bc337-1f07-47ab-853c-e7484b6b6661',
        Order: 'b2e81319-fd3c-4ee4-aae6-f3547efee8b6',
        Death: '9a1ff3fc-662d-4e98-ae89-8fe0b08136f8',
        Destruction: '0cc9bec3-40fe-4ed4-af4e-3e2e9e099c31',
        Chaos: 'a25e9b34-58df-468f-8f57-d7f7cbdfaec1'
    },
    newPlayer: {
        name: '',
        alliance: {
            name: 'Chaos',
            id: '90175462-fae6-41e4-a0fe-19e41a833c9a'
        },
        allegiance: {
            name: '',
            id: ''
        },
        roster: '',
        vp: 0,
        cp: 4
    },
    battleplans: [
        {
            "id": "57ac18e5-16dd-4291-956a-c1af34154976",
            "title": "Shifting Objectives",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'Primary Objective', id: 'primaryObjective', value: 2, completed: false},
                {title: 'First Secondary Objective', id: 'firstSecondaryObjective', value: 1, completed: false},
                {title: 'Second Secondary Objective', id: 'SecondSecondaryObjective', value: 1, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false}
            ]
        },
        {
            "id": "97c0441a-4155-47b3-92bb-ed612265dcae",
            "title": "Focal Points",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 1, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 1, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 1, completed: false},
                {title: '2 or more home/flank objectives', id: 'home/flank', value: 3, completed: false}
            ]
        },
        {
            "id": "3651f2c9-b014-4200-8fa8-84c9fda8ff0f",
            "title": "Starstrike",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One ', id: 'one', value: 3, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 3, completed: false}
            ]
        },
        {
            "id": "53d86219-6dae-4b17-97ab-e2fa8279c949",
            "title": "Feral Foray",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 2, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 2, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false}
            ]
        },
        {
            "id": "375743bf-f4c8-4eff-ba26-4fc304ce8d4f",
            "title": "The Jaws of Gallet",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 2, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 2, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false}
            ]
        },
        {
            "id": "ee208ce6-8301-4c4e-b633-37005af617e9",
            "title": "Battle for the Pass",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'Home', id: 'home', value: 1, completed: false},
                {title: 'First Border', id: 'firstBorder', value: 2, completed: false},
                {title: 'Second Border', id: 'secondBorder', value: 2, completed: false},
                {title: 'Enemy', id: 'enemy', value: 5, completed: false}
            ],
            "maxForObjectives": 6
        },
        {
            "id": "010ccbf9-b896-4947-aedb-a6271fbe5f6a",
            "title": "Scorched Earth",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 2, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 2, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false}
            ]
        },
        {
            "id": "49c4348b-f9c3-4e6c-8ea1-9b8c50542b71",
            "title": "The Better Part of Valour",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 2, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 2, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false}
            ]
        },
        {
            "id": "aac58435-a144-4260-a633-c17558c2014f",
            "title": "The Vice",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 2, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 2, completed: false, round: '3-'},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false},
                {title: 'No Enemy Units Near', id: 'noEnemyUnitsNear', value: 2, completed: false, round: '4+'}
            ]
        },
        {
            "id": "c9352833-c2e9-4883-86b5-f54ee37f2e70",
            "title": "Close to the Chest",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 1, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 1, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false},
                {title: 'Primary Objective', id: 'primaryObjective', value: 2, completed: false}
            ]
        },
        {
            "id": "feb5d29e-a134-4842-ad59-9b06ff5846de",
            "title": "Limited Resources",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'One', id: 'one', value: 2, completed: false},
                {title: 'Two and More', id: 'twoAndMore', value: 2, completed: false},
                {title: 'More Than Opp', id: 'moreThan', value: 2, completed: false}
            ]
        },
        {
            "id": "86dbc020-5032-4f29-8753-e9d11e41c2e3",
            "title": "Border War",
            "scoreParams": [
                {title: 'Tactics Complete', id: 'tactics', value: 4, completed: false},
                {title: 'Friendly Objective', id: 'friendlyObjective', value: 1, completed: false},
                {title: 'First Border Objective', id: 'firstBorderObjective', value: 2, completed: false},
                {title: 'Second Border Objective', id: 'secondBorderObjective', value: 2, completed: false},
                {title: 'Enemy Objective', id: 'enemyObjective', value: 5, completed: false}
            ],
            "maxForObjectives": 6
        }
    ],
    toastParams: {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        theme: 'colored',
        pauseOnHove: false
    },
    newCalcUnit: {
        name: '',
        weapons:  [{critOn: {modificator: 1, title: '6+'}}]
    },
    accordionStyle: {
        borderRadius: 'md',
        [`& .${accordionSummaryClasses.button}:hover`]: {
            'background-color': '#2E2D32'
        },
        '& button:not([aria-selected="true"]):active': {
            background: '#2E2D32',
        },
        '& button:not([aria-selected="true"]):hover': {
            background: '#2E2D32',
        }
    },
    defaultIsCollapseUnitsTypes: {
        'Epic Hero': false,
        'Character': false,
        'Battleline': false,
        'Infantry': false,
        'Mounted': false,
        'Beasts': false,
        'Beast': false,
        'Monster': false,
        'Vehicle': false,
        'Dedicated Transport': false,
        'Artillery': false,
        'Swarm': false,
        'Fortification': false
    },
    defaultIsCollapseRegimentAlliances: {
        'Imperium': false,
        'Imperium - Adeptus Astartes': false,
        'Chaos': false,
        'Xenos': false
    },
    vanilSpaceMarinesId: '01623188-9470-4441-96b0-e06eb2572bb5',
    vanilSpaceMarinesCodexId: '58c77720-0edd-418f-a8ab-56a774bfc8bf',
    EmperorsChildrenCodexId: 'bc2940c7-b4e3-4d2b-ac39-5bc2df3ad21c',
    AeldariCodexId: '995328e1-ae96-4ef6-b548-c31fad1a06fc'
}

export default Constants