import React, {useCallback} from 'react'
import Accordion from '@mui/joy/Accordion'
import AccordionDetails from '@mui/joy/AccordionDetails'
import AccordionSummary from '@mui/joy/AccordionSummary'
import Constants from '../Constants'

import map from 'lodash/map'

import Styles from './styles/Accordion.module.css'

const CustomAccordion = ({expanded, title, data, renderItem, onChangeExpand}) => {

    const handleChangeExpand = useCallback((e) => {
        if (onChangeExpand) {
            onChangeExpand(e)
        }
    }, [onChangeExpand])

    return <div id={Styles.typeContainer} key={title}>
        <Accordion expanded={expanded} defaultExpanded={true} onChange={handleChangeExpand}>
            <AccordionSummary id={Styles.headerContainer} sx={(theme) => (Constants.accordionStyle)}>
                <h4 id={Styles.header}>{title}</h4>
            </AccordionSummary>
            <AccordionDetails>
                {map(data, renderItem)}
            </AccordionDetails>
        </Accordion>
    </div>
}

export default CustomAccordion